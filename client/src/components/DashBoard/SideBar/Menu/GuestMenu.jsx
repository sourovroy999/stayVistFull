import { BsFingerprint } from 'react-icons/bs'
import { GrUserAdmin } from 'react-icons/gr'
import MenuItem from './/MenuItem'
import useRole from '../../../../hooks/useRole'
import toast from 'react-hot-toast'
import { useState } from 'react'
import HostModal from '../../../Modal/HostRequestModal'
import useAxiosSecure from '../../../../hooks/useAxiosSecure'
import useAuth from '../../../../hooks/useAuth'

const GuestMenu = () => {

   const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    
  
    const axiosSecure=useAxiosSecure()
  
    //for modal
    const[isModalOpen, setIsModalOpen]=useState(false)
  
    const closeModal=()=>
      {setIsModalOpen(false)}
    
    const modalHandler=async()=>{
      closeModal()
  
      console.log('i want to be a host');
  
      try {
        //
          const currentUser={
              email:user?.email,
              role:'guest',
              status:'Requested',
            }
        
            const {data}=await axiosSecure.put(`/user`, currentUser)
           console.log(data);
           if(data.modifiedCount>0){
            toast.success('Request to be host has been sent! please wait for admin approval')
           }
           else{
            toast.error('please wait dor admin approval')
           }
  
           
  
      } catch (error) {
        //
        console.log(error);
        toast.error(error.message)
        
      } finally{
        closeModal()
      }
    }

  const [role]=useRole()
  console.log(role);
  
  return (
    <>
      <MenuItem
        icon={BsFingerprint}
        label='My Bookings'
        address='my-bookings'
      />
      
       {
        role === 'guest' && (
           <div 
           onClick={()=>setIsModalOpen(true)}
           className='flex items-center px-4 py-2 mt-5  transition-colors duration-300 transform text-gray-600  hover:bg-gray-300   hover:text-gray-700 cursor-pointer'>
        <GrUserAdmin className='w-5 h-5' />

   

        <span className='mx-4 font-medium'>Become A Host</span>
      </div>

        )
        
      }

      {/* modal */}
                      <HostModal isOpen={isModalOpen} closeModal={closeModal} modalHandler={modalHandler}/>

      

    </>
  )
}

export default GuestMenu