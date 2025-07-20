const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const nodemailer = require("nodemailer");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const port = process.env.PORT || 9000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())



//send email
const sendEmail=async(emailAddress, emailData)=>{
  // Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service:"gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.TRANSPORTER_EMAIL,
    pass: process.env.TRANSPORTER_PASS,
  },
});

//verify transporter
transporter.verify(function(error, success){
  if(error){
    console.log(error);
    
  }
  else{
    console.log('server is ready to take our message');
    
  }
})

const mailBody={
    from: `"stayVista" <${process.env.TRANSPORTER_EMAIL}>`,
    to: emailAddress,
    subject: emailData.subject,
  
    html: emailData.message, // HTML body
  }

  const info =  transporter.sendMail(mailBody, (error, info)=>{
    if(error){
      console.log(error);
      
    }else{
      console.log('email sent' +info.response);
      
    }
  });


  // console.log(info.messageId);
  


}

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  console.log(token)
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy6spfv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const db = client.db('stayvista')
    const roomsCollection = db.collection('rooms')
    const usersCollection = db.collection('users')

    const bookingsCollection = db.collection('bookings')


    const verifyHost = async (req, res, next) => {
      const user = req.user; //it comes from verify token
      const query = { email: user?.email };

      const result = await usersCollection.findOne(query)

      if (!result || result.role !== 'host') {
        return res.status(401).send({ message: 'unauthorized accesss' })
      }

      next()
    }


    const verifyAdmin = async (req, res, next) => {
      const user = req.user; //it comes from verify token
      const query = { email: user?.email };

      const result = await usersCollection.findOne(query)

      if (!result || result.role !== 'admin') {
        return res.status(401).send({ message: 'unauthorized accesss' })
      }

      next()
    }




    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })
    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
        console.log('Logout successful')
      } catch (err) {
        res.status(500).send(err)
      }
    })


    //create payment intent
    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      try {
        const { price } = req.body;

        // Validate price
        if (!price || isNaN(price) || price <= 0) {
          return res.status(400).send({
            error: 'Invalid price. Price must be a positive number.'
          });
        }

        const priceInCent = Math.round(parseFloat(price) * 100);

        if (priceInCent < 50) { // Stripe minimum is $0.50
          return res.status(400).send({
            error: 'Amount must be at least $0.50 USD'
          });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: priceInCent,
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            userId: req.user.email,
          }
        });

        // Send client secret as response
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (error) {
        console.error('Payment intent creation failed:', error);
        res.status(500).send({
          error: 'Failed to create payment intent'
        });
      }
    });

    //save user data in db
    app.put('/user', async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };


      //check if user already exists in db
      const isExist = await usersCollection.findOne(query)

      if (isExist) {
        if (user.status === 'Requested') {
          const result = await usersCollection.updateOne(query, {
            $set: { status: user?.status },

          })
          return res.send(result)
        }
        else {
          return res.send(isExist)
        }
      }



      //save user for the first time
      const options = { upsert: true }

      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        }
      }

      const result = await usersCollection.updateOne(query, updateDoc, options)
      res.send(result);
    })

    //get a user info by email
    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email })
      res.send(result)

    })


    //get all users data from db for admin
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result)
    })

    //update user role
    app.patch('/users/update/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email };
      const updateDoc = {
        $set: {
          ...user, timestamp: Date.now()
        }
      }

      const result = await usersCollection.updateOne(query, updateDoc)
      res.send(result);



    })

    // Get all rooms from db
    app.get('/rooms', async (req, res) => {
      const category = req.query.category
      console.log(category)
      let query = {}
      if (category && category !== 'null') query = { category }
      const result = await roomsCollection.find(query).toArray()
      res.send(result)
    })

    //save a room in db
    app.post('/room', verifyToken, verifyHost, async (req, res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData);
      res.send(result)

    })

    //delete a room in db
    app.delete('/room/:id', verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.deleteOne(query);

      res.send(result)
    })

    //get all rooms for host
    app.get('/my-listings/:email', verifyToken, verifyHost, async (req, res) => {
      const email = req.params.email
      console.log(email)
      let query = { 'host.email': email }

      const result = await roomsCollection.find(query).toArray()
      console.log('Rooms found:', result.length);

      res.send(result)
    })

    //save a booking in db
    app.post('/booking', verifyToken, async (req, res) => {
      const bookingData = req.body;

      //insert bookings collection
      const result = await bookingsCollection.insertOne(bookingData);

      //send email to guest
      sendEmail(bookingData?.guest?.email, {
        subject:'Booking successful',
        message:`you'hv successfully booked a room through stayvista. transactionId: ${bookingData.transactionId}`
      })

        //send email to host
      sendEmail(bookingData?.host?.email, {
        subject:'Your room got booked',
        message:`Get ready to welcome: ${bookingData.guest.name}`
      })

      //i wont use this
      // //change room availiability status
      // const roomId=bookingData?.roomId;
      // const query={_id: new ObjectId(roomId)}
      // const updatedDoc={
      //   $set:{
      //     booked: true
      //   }
      // }


      // const updatedRoom=await roomsCollection.updateOne(query, updatedDoc)
      // console.log(updatedDoc);      

      res.send(result)

    })

    //update room status

    app.patch('/room/status/:id', verifyToken, async (req, res) => {

      const id = req.params.id;
      const { status } = req.body;
      //change room availiability status

      const query = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          booked: status
        }
      }


      const result = await roomsCollection.updateOne(query, updatedDoc)
      console.log(result);
      res.send(result)


    })


    // Get a single room data from db using _id
    app.get('/room/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })

    //get all bookings for a guest
    app.get('/my-bookings/:email', verifyToken, async (req, res) => {
      const email = req.params.email;

      const query = { 'guest.email': email }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result)

    })

    //manage all bookings for a host
    app.get('/manage-bookings/:email', verifyToken, verifyHost, async (req, res) => {
      const email = req.params.email;

      const query = { 'host.email': email }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result)

    })

    //delete a booking
    app.delete('/booking/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result)
    })


    //admin stats
    app.get('/admin-stats',verifyToken, verifyAdmin, async (req, res) => {
      const bookingDetails = await bookingsCollection.find(
        {},
        {
          projection: {
            date: 1,
            price: 1
          }
        }).toArray()

      const totalUser = await usersCollection.countDocuments();

      const totalRooms = await roomsCollection.countDocuments();

      const totalPrice= bookingDetails.reduce((sum, booking)=>sum+booking.price,0)

//   const data = [
//   ['Day', 'Sales'],
//   ['9', 1000],
//   ['10', 1170],
//   ['11', 660],
//   ['12', 1030],
// ]

      const chartData= bookingDetails.map(booking=>{
        const day=new Date(booking.date).getDate();
        const month=new Date(booking.date).getMonth() + 1;

       const data=  [`${day}/${month}`, booking?.price];
       return data;
       
     
      })
      chartData.unshift(['Day', 'Sales'])


      res.send({ bookingDetails, totalUser, totalRooms, totalBookings: bookingDetails.length, totalPrice, chartData })
      // res.send(chartData)

    })


    
    //host stats
    app.get('/host-stats', verifyToken, verifyHost, async (req, res) => {

      // const email=req.user.email;
      const {email}=req.user; //same as above way

      const bookingDetails = await bookingsCollection.find(
        {"host.email":email},
        {
          projection: {
            date: 1,
            price: 1
          }
        }).toArray()

      const totalRooms = await roomsCollection.countDocuments({"host.email":email});

      const totalPrice=bookingDetails.reduce((sum, booking)=>sum+booking.price,0)

     const {timestamp}= await usersCollection.findOne({email}, {projection:{timestamp:1}})

      const chartData= bookingDetails.map(booking=>{
        const day=new Date(booking.date).getDate();
        const month=new Date(booking.date).getMonth() + 1;

       const data=  [`${day}/${month}`, booking?.price];
       return data;
       
     
      })
      chartData.unshift(['Day', 'Sales'])


      res.send({  
        
        totalRooms, 
        totalBookings: bookingDetails.length, 
        totalPrice, 
        chartData ,
        hostSince:timestamp
      })

    })
    
    //Guest stats
    app.get('/guest-stats', verifyToken, async (req, res) => {

      // const email=req.user.email;
      const {email}=req.user; //same as above way

      const bookingDetails = await bookingsCollection.find(
        {"guest.email":email},
        {
          projection: {
            date: 1,
            price: 1
          }
        }).toArray()

      const totalPrice=bookingDetails.reduce((sum, booking)=>sum+booking.price,0)

     const {timestamp}= await usersCollection.findOne({email}, {projection:{timestamp:1}})

      const chartData= bookingDetails.map(booking=>{
        const day=new Date(booking.date).getDate();
        const month=new Date(booking.date).getMonth() + 1;

       const data=  [`${day}/${month}`, booking?.price];
       return data;
       
     
      })
      chartData.unshift(['Day', 'Sales'])


      res.send({  
        
         
        totalBookings: bookingDetails.length, 
        totalPrice, 
        chartData ,
        guestSince:timestamp
      })

    })

    //update room data
    app.put('/room/update/:id', verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const roomData = req.body;

      const query = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: roomData
      }

      const result = await roomsCollection.updateOne(query, updateDoc)
      res.send(result)

    })


    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from StayVista Server..')
})

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`)
})
