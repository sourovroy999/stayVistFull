
import { categories } from '../Categories/CategoriesData'
import { DateRange } from 'react-date-range';

// eslint-disable-next-line react/prop-types
const UpdateRoomForm = ({ handleSubmit, dates, handleDates, loading, handleImage, setRoomData, roomData }) => {
  // console.log(roomData);

  return (
    <div className='w-full min-h-[calc(100vh-40px)] flex flex-col justify-center items-center text-gray-800 rounded-xl bg-gray-50'>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-1 gap-10'>
          <div className='space-y-1 text-sm'>
            <label htmlFor='location' className='block text-gray-600'>
              Location
            </label>
            <input
              className='w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md '
              name='location'
              id='location'
              type='text'
              value={roomData?.location}
              onChange={e => setRoomData({ ...roomData, location: e.target.value })}
              placeholder='Location'
              required
            />
          </div>
          <div className='space-y-1 text-sm'>
            <label htmlFor='title' className='block text-gray-600'>
              Title
            </label>
            <input
              className='w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md '
              name='title'
              id='title'
              value={roomData?.title}
              onChange={e => setRoomData({ ...roomData, title: e.target.value })}
              type='text'
              placeholder='Title'
              required
            />
          </div>

          <div className='space-y-1 text-sm'>
            <label htmlFor='category' className='block text-gray-600'>
              Category
            </label>
            <select
              required
              value={roomData?.category}
              onChange={e => setRoomData({ ...roomData, category: e.target.value })}
              className='w-full px-4 py-3 border-rose-300 focus:outline-rose-500 rounded-md'
              name='category'
            >
              {categories.map(category => (
                <option value={category.label} key={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1'>
            <label htmlFor='location' className='block text-gray-600'>
              Select Availability Range
            </label>
            <div className='flex justify-center pt-2'>{/* Calender */}
             
              <DateRange
                minDate={new (Date)}
                rangeColors={['#F43F5E']}
                editableDateInputs={true}
                onChange={item => handleDates(item)}
                // onChange={item => setState([item.selection])}
                moveRangeOnFirstSelection={false}
                ranges={[dates]}
              />



            </div>
          </div>

          <div className=' p-4 bg-white w-full  m-auto rounded-lg'>
            <div className='file_upload px-5 py-3 relative border-4 border-dotted border-gray-300 rounded-lg'>
              <div className='flex flex-col w-max mx-auto text-center'>
                <label>
                  <input
                    className='text-sm cursor-pointer w-36 hidden'
                    type='file'
                    name='image'
                    onChange={(e) => handleImage(e.target.files[0])}
                    id='image'
                    accept='image/*'
                    hidden
                  />
                  <div className='bg-rose-500 text-white border border-gray-300 rounded font-semibold cursor-pointer p-1 px-3 hover:bg-rose-500'>
                    Upload Image
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className='flex justify-between gap-2'>
            <div className='space-y-1 text-sm'>
              <label htmlFor='price' className='block text-gray-600'>
                Price
              </label>
              <input
                className='w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md '
                name='price'
                value={roomData?.price}
                onChange={e => setRoomData({ ...roomData, price: e.target.value })}
                id='price'
                type='number'
                placeholder='Price'
                required
              />
            </div>

            <div className='space-y-1 text-sm'>
              <label htmlFor='guest' className='block text-gray-600'>
                Total guest
              </label>
              <input
                value={roomData?.guest}
                onChange={e => setRoomData({ ...roomData, guest: e.target.value })}
                className='w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md '
                name='total_guest'
                id='guest'
                type='number'
                placeholder='Total guest'
                required
              />
            </div>
          </div>

          <div className='flex justify-between gap-2'>
            <div className='space-y-1 text-sm'>
              <label htmlFor='bedrooms' className='block text-gray-600'>
                Bedrooms
              </label>
              <input
                value={roomData?.bedrooms}
                onChange={e => setRoomData({ ...roomData, bedrooms: e.target.value })}
                className='w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md '
                name='bedrooms'
                id='bedrooms'
                type='number'
                placeholder='Bedrooms'
                required
              />
            </div>

            <div className='space-y-1 text-sm'>
              <label htmlFor='bathrooms' className='block text-gray-600'>
                Bathrooms
              </label>
              <input
                value={roomData?.bedrooms}
                onChange={e => setRoomData({ ...roomData, bedrooms: e.target.value })}
                className='w-full px-4 py-3 text-gray-800 border border-rose-300 focus:outline-rose-500 rounded-md '
                name='bathrooms'
                id='bathrooms'
                type='number'
                placeholder='Bathrooms'
                required
              />
            </div>
          </div>

          <div className='space-y-1 text-sm'>
            <label htmlFor='description' className='block text-gray-600'>
              Description
            </label>

            <textarea
              value={roomData?.description}
              onChange={e => setRoomData({ ...roomData, description: e.target.value })}
              id='description'
              className='block rounded-md focus:rose-300 w-full h-32 px-4 py-3 text-gray-800  border border-rose-300 focus:outline-rose-500 '
              name='description'
            ></textarea>
          </div>
        </div>

        <button
          type='submit'
          className='w-full p-3 mt-5 text-center font-medium text-white transition duration-200 rounded shadow-md bg-rose-500'
        >
          Update
        </button>
      </form>
    </div>
  )
}

export default UpdateRoomForm
