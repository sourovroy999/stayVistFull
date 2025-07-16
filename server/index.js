const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const stripe=require("stripe")(process.env.VITE_STRIPE_SECRET_KEY)

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
    const db=client.db('stayvista')
    const roomsCollection = db.collection('rooms')
    const usersCollection = db.collection('users')

    const bookingsCollection=db.collection('bookings')


    const verifyHost= async (req,res,next)=>{
      const user=req.user; //it comes from verify token
      const query={email:user?.email};

      const result=await usersCollection.findOne(query)

      if(!result || result.role!=='host'){
        return res.status(401).send({message:'unauthorized accesss'})
      }

      next()
    }


    const verifyAdmin= async (req,res,next)=>{
      const user=req.user; //it comes from verify token
      const query={email:user?.email};

      const result=await usersCollection.findOne(query)

      if(!result || result.role!=='admin'){
        return res.status(401).send({message:'unauthorized accesss'})
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
    app.post("/create-payment-intent",verifyToken, async (req, res) => {
      console.log(req.body);

      // console.log(res);

      
      
  const price = req.body.price;
  console.log(price);
  
  const priceInCent=parseFloat(price)*100;
  console.log(priceInCent);
  

  if(!price || priceInCent<1) return


  // Create a PaymentIntent with the order amount and currency

  //generate client secret
  const paymentIntent = await stripe.paymentIntents.create({
    amount: priceInCent,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

//send client secret as response
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

    //save user data in db
    app.put('/user', async(req,res)=>{
      const user=req.body;
      const query={email: user?.email};


      //check if user already exists in db
      const isExist=await usersCollection.findOne(query)

      if(isExist){
        if(user.status === 'Requested'){
          const result=await usersCollection.updateOne(query, {
            $set:{status: user?.status},

          })
          return res.send(result)
        }
        else{
        return res.send(isExist)
      }
      }

      

      //save user for the first time
      const options={upsert: true}

      const updateDoc={
        $set:{
          ...user,
          timestamp:Date.now(),
        }
      }

      const result=await usersCollection.updateOne(query, updateDoc, options)
      res.send(result);
    })

    //get a user info by email
    app.get('/user/:email', async(req,res)=>{
      const email=req.params.email;
      const result=await usersCollection.findOne ({email})
      res.send(result)
      
    })


    //get all users data from db for admin
    app.get('/users',verifyToken, verifyAdmin, async(req, res)=>{
      const result=await usersCollection.find().toArray();
      res.send(result)
    })

    //update user role
    app.patch('/users/update/:email', async(req,res)=>{
      const email=req.params.email;
      const user=req.body;
      const query={email};
      const updateDoc={
        $set:{
          ...user, timestamp:Date.now()
        }
      }

      const result=await usersCollection.updateOne(query, updateDoc)
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
    app.post('/room',verifyToken, verifyHost, async(req,res)=>{
      const roomData=req.body;
      const result=await roomsCollection.insertOne(roomData);
      res.send(result)

    })

    //delete a room in db
    app.delete('/room/:id',verifyToken, verifyHost, async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result=await roomsCollection.deleteOne(query);

      res.send(result)
    })

    //get all rooms for host
      app.get('/my-listings/:email',verifyToken, verifyHost, async (req, res) => {
      const email = req.params.email
      console.log(email)
      let query = {'host.email':email}
     
      const result = await roomsCollection.find(query).toArray()
      console.log('Rooms found:', result.length);

      res.send(result)
    })

       //save a booking in db
    app.post('/booking',verifyToken, async(req,res)=>{
      const bookingData=req.body;
      const result=await bookingsCollection.insertOne(bookingData);

      //change room availiability status
      const roomId=bookingData?.roomId;
      const query={_id: new ObjectId(roomId)}
      const updatedDoc={
        $set:{
          booked: true
        }
      }
      const updatedRoom=await roomsCollection.updateOne(query, updatedDoc)
      console.log(updatedDoc);
      
      res.send({result,updatedRoom})


    })


    // Get a single room data from db using _id
    app.get('/room/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await roomsCollection.findOne(query)
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
