import PropTypes from 'prop-types'
import { useState } from 'react'
import UpdateRoleModal from '../../Modal/UpdateRoleModal'
import {useMutation} from '@tanstack/react-query'
import { axiosSecure } from '../../../hooks/useAxiosSecure'
import toast from 'react-hot-toast'
import useAuth from '../../../hooks/useAuth'

const UserDataRow = ({ user, refetch }) => {
    const[isOpen, setIsOpen]=useState(false)
    console.log(user);
    

    const{user:loggedInUser}=useAuth()

    const{mutateAsync}=useMutation({
        mutationFn: async userme=>{
            const {data}=await axiosSecure.patch(`/users/update/${user?.email}`, userme)
            return data;
        },
        onSuccess: data=>{
            refetch()
            console.log(data);
            toast.success('User Role Updated Successfully');
            setIsOpen(false)
        }
    })

    //modalHandler
    const modalHandler= async(selected)=>{
        console.log('user role updated', selected);

        if(loggedInUser.email === user.email){
            toast.error("Action Not Permitted")
            return setIsOpen(false)
        }

        const user2={
            role:selected,
            status:'Verified',
        }

        try {
            await mutateAsync(user2)
            
            
        } catch (error) {
            console.log(error);
            toast.error(error.message)
            
        }
        
    }

  return (
    <tr>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>{user?.email}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <p className='text-gray-900 whitespace-no-wrap'>{user?.role}</p>
      </td>
      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        {user?.status ? (
          <p
            className={`${
              user.status === 'Verified' ? 'text-green-500' : 'text-yellow-500'
            } whitespace-no-wrap`}
          >
            {user.status}
          </p>
        ) : (
          <p className='text-red-500 whitespace-no-wrap'>Unavailable</p>
        )}
      </td>

      <td className='px-5 py-5 border-b border-gray-200 bg-white text-sm'>
        <button 
        onClick={()=> setIsOpen(true)}
        className='relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight'>
          <span
            aria-hidden='true'
            className='absolute inset-0 bg-green-200 opacity-50 rounded-full'
          ></span>
          <span className='relative'>Update Role</span>
        </button>

        {/* Update User Modal */}
        <UpdateRoleModal
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        modalHandler={modalHandler}
        user={user}
        />

        
      </td>
    </tr>
  )
}

UserDataRow.propTypes = {
  user: PropTypes.object,
  refetch: PropTypes.func,
}

export default UserDataRow