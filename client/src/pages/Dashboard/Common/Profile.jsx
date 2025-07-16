import useAuth from '../../../hooks/useAuth'
import { Helmet } from 'react-helmet-async'
import useRole from '../../../hooks/useRole'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'
import UpdateUserModal from '../../../components/Modal/UpdateUserModal'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { imageUpload } from '../../../api/utils'

const Profile = () => {
  const { user,setUser,loading , updateUserProfile} = useAuth() || {}
  const[role, isLoading]=useRole()

    //for modal
    const[isModalOpen, setIsModalOpen]=useState(false)
  
    const closeModal=()=>
      {
        setIsModalOpen(false)

      }

      

    
  const modalHandler=async(formData)=>{
    closeModal()
console.log(formData);
         
const name=formData?.name;
const photo=formData?.photo;




    console.log('update xlixked btnn');

    //update the user. i shoud use 

    try {
        const image_url=await imageUpload(photo);
        console.log(image_url);
        
        //
       await updateUserProfile(name,image_url)

       //update local user context
    //    const updatedUser={
    //     ...user,
    //     displayName:name,
    //     photoURL:image_url
    //    }
    //    setUser(updatedUser)
       
       toast.success('Profile Updated')
        
    } catch (error) {
        //
        console.log(error);
        
    }

    


    // try {
    //   //
    //     const currentUser={
    //         email:user?.email,
    //         role:'guest',
    //         status:'Requested',
    //       }
      
    //       const {data}=await axiosSecure.put(`/user`, currentUser)
    //      console.log(data);
    //      if(data.modifiedCount>0){
    //       toast.success('Request to be host has been sent! please wait for admin approval')
    //      }
    //      else{
    //       toast.error('please wait dor admin approval')
    //      }

         

    // } catch (error) {
    //   //
    //   console.log(error);
    //   toast.error(error.message)
      
    // } finally{
    //   closeModal()
    // }


  }



  if(loading || isLoading) return <LoadingSpinner/>

  

  console.log(user)
  return (
    <div className='flex justify-center items-center h-screen'>
      <Helmet>
        <title>Profile</title>
      </Helmet>
      <div className='bg-white shadow-lg rounded-2xl w-3/5'>
        <img
          alt='profile'
          src='https://wallpapercave.com/wp/wp10784415.jpg'
          className='w-full mb-4 rounded-t-lg h-36'
        />
        <div className='flex flex-col items-center justify-center p-4 -mt-16'>
          <a href='#' className='relative block'>
            <img
              alt='profile'
              src={user?.photoURL}
              className='mx-auto object-cover rounded-full h-24 w-24  border-2 border-white '
            />
          </a>

          <p className='p-2 px-4 text-xs text-white bg-pink-500 rounded-full uppercase'>
            {role}
          </p>
          <p className='mt-2 text-xl font-medium text-gray-800 '>
            User Id: {user?.uid}
          </p>
          <div className='w-full p-2 mt-4 rounded-lg'>
            <div className='flex flex-wrap items-center justify-between text-sm text-gray-600 '>
              <p className='flex flex-col'>
                Name
                <span className='font-bold text-black '>
                  {user?.displayName}
                </span>
              </p>
              <p className='flex flex-col'>
                Email
                <span className='font-bold text-black '>{user?.email}</span>
              </p>

              <div>
                <button onClick={()=>setIsModalOpen(true)} className='bg-[#F43F5E] px-10 py-1 rounded-lg text-white cursor-pointer hover:bg-[#af4053] block mb-1'>
                  Update Profile
                </button>
                <UpdateUserModal isOpen={isModalOpen} closeModal={closeModal} modalHandler={modalHandler} />


                <button className='bg-[#F43F5E] px-7 py-1 rounded-lg text-white cursor-pointer hover:bg-[#af4053]'>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile