import { useMutation, useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import useAxiosSecure from '../../../hooks/useAxiosSecure'
import useAuth from '../../../hooks/useAuth'
import LoadingSpinner from '../../../components/Shared/LoadingSpinner'
import RoomDataRow from '../../../components/DashBoard/TableRows/RoomDataRow'

import toast from 'react-hot-toast'


const MyListings = () => {

    const axiosSecure=useAxiosSecure()
    const {user}=useAuth()
    
    //fetch rooms data
      const { data: rooms = [], isLoading, refetch } = useQuery({
    queryKey: ['my-listings', user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`my-listings/${user?.email}`)

      return data
    },
  })

  //delete
  const {mutateAsync}=useMutation({
    mutationFn:async (id)=>{
      const{data}=await axiosSecure.delete(`/room/${id}`)
      return data;
    },
    onSuccess: (data)=>{
      console.log(data);
      refetch()
      toast.success('Room Deleted Successfully')

            
    }
  })

  //handle delete

  const handleDelete= async(id)=>{
    console.log(id);

    try {
      await mutateAsync(id)
      
    } catch (error) {
      console.log(error);
      
    }

  }


  if (isLoading) return <LoadingSpinner/>

  console.log(rooms);

  
  
  return (
    <>
      <Helmet>
        <title>My Listings</title>
      </Helmet>

      <div className='container mx-auto px-4 sm:px-8'>
    
        <div className='py-8'>
          <div className='-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto'>
            <div className='inline-block min-w-full shadow rounded-lg overflow-hidden'>
              <table className='min-w-full leading-normal'>
                <thead>
                  <tr>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Title
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Location
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Price
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      From
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      To
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Delete
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Update
                    </th>
                  </tr>
                </thead>
                <tbody>

                    {rooms.map(room=>(
                        <RoomDataRow key={room._id} room={room} 
                        handleDelete={handleDelete}
                        refetch={refetch}
                        />
                    ))}


                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MyListings