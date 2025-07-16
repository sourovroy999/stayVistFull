

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import './CheckOutForm.css';

import { ImSpinner9 } from "react-icons/im";

import toast from 'react-hot-toast'


import { useEffect, useState } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import PropTypes from 'prop-types'
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({closeModal, bookingInfo, refetch}) => {
    // console.log(bookingInfo);
    const axiossecure=useAxiosSecure()
    const navigate=useNavigate()
  const stripe = useStripe();
  const elements = useElements();
    const [clientSecret, setClientSecret] = useState()
    const[cardError, setCardError]=useState('')
    const[processing,setProcessing]=useState(false)

    const {user}=useAuth()

    useEffect(()=>{
        //fetch client secret
        if(bookingInfo?.price >1){
            getClientSecret(bookingInfo?.price)
        }

    },[bookingInfo?.price])

    //get client secret
    const getClientSecret=async price=>{
        // console.log(price);
        
        const {data}=await axiossecure.post('/create-payment-intent', {price})
        // return data;
        // console.log(data);
        
        // console.log('client request from server-->',data);
        
        setClientSecret(data.clientSecret)
    }

    // console.log(clientSecret);
    



  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();
    setProcessing(true)

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const card = elements.getElement(CardElement);

    if (card == null) {
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      console.log('[error]', error);
      setCardError(error.message)
      return
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      setCardError('')
    }

     //confirm payment
  const {error:confirmError, paymentIntent}= await stripe.confirmCardPayment(clientSecret,{
    payment_method:{
        card:card,
        billing_details:{
            email:user?.email,
            name:user?.displayName,
        }
    }
  } )

  if(confirmError){
    console.log(confirmError);
    setCardError(confirmError.message)
    setProcessing(false)
    return
  }
  console.log(paymentIntent);
  

  if(paymentIntent.status === 'succeeded'){

    //1.create payment info object

    const paymentInfo={
        ...bookingInfo,
        roomId:bookingInfo._id,
        transactionId:paymentIntent.id,
        date:new Date(),
    }
    delete paymentInfo._id;
    console.log(paymentInfo);



    try {
        
    //2.save payment info in booking collection(db)
    const {data}=await axiossecure.post('/booking', paymentInfo)
    console.log(data);
    toast.success('Room Booked Successfully')
    navigate('/dashboard/my-bookings')

    //update ui
    refetch()
    
    //3.change room status to booked in db
   
    
    } catch (error) {
        //
        // console.log(error);
        
    }
    
    closeModal(true)


  }


  };

 

  return (
    <>
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#9e2146',
            },
          },
        }}
      />
      
                       <div className='flex mt-2 justify-around'>
                        <button  type="submit" disabled={!stripe} onClick= {()=> {
                          
                          closeModal()
                        }}
                          
                          className='inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                        >
                          Cancel
                        </button>
                        <button
                           type="submit" disabled={!stripe || !clientSecret || processing}
                          className='inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2'
                          
                        >
                            {
                                processing ? <ImSpinner9 size={24} className='items-center my-auto animate-spin'
                                
                                />

                                :
                            
                          (
                            `Pay ${bookingInfo?.price}`
                        )

                            }


                          
                        </button>
                      </div>
    </form>

    {
        cardError && <p className='text-red-500'>{cardError}</p>
    }
    </>
  );
};

export default CheckoutForm


CheckoutForm.propTypes = {
  bookingInfo: PropTypes.object,
  closeModal: PropTypes.func,
  isOpen: PropTypes.bool,
}