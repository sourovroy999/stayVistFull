import PropTypes from 'prop-types'
import {
  Dialog,
  Transition,
  TransitionChild,
  DialogTitle,
  DialogPanel,
} from '@headlessui/react'
import { Fragment, useState } from 'react'
// import useAuth from '../../hooks/useAuth'

const UpdateUserModal = ({ closeModal, isOpen, modalHandler, currentUser }) => {

  // const{user}=useAuth()


  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    photo: null,
    photoPreview: currentUser?.photo || null
  })

  // console.log(formData);
  

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photo: file,
          photoPreview: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    modalHandler(formData)
  }

  const resetForm = () => {
    setFormData({
      name: currentUser?.name || '',
      photo: null,
      photoPreview: currentUser?.photo || null
    })
  }

  const handleClose = () => {
    resetForm()
    closeModal()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25' />
        </TransitionChild>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <DialogPanel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                <DialogTitle
                  as='h3'
                  className='text-lg font-medium text-center leading-6 text-gray-900'
                >
                  Update Profile
                </DialogTitle>
                
                <form onSubmit={handleSubmit} className='mt-4'>
                  {/* Photo Upload Section */}
                  <div className='mb-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Profile Photo
                    </label>
                    <div className='flex flex-col items-center'>
                      <div className='w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4'>
                        {formData.photoPreview ? (
                          <img
                            src={formData.photoPreview}
                            alt='Profile preview'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center text-gray-400'>
                            <svg className='w-8 h-8' fill='currentColor' viewBox='0 0 20 20'>
                              <path fillRule='evenodd' d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' clipRule='evenodd' />
                            </svg>
                          </div>
                        )}
                      </div>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handlePhotoChange}
                        className='hidden'
                        id='photo-upload'
                      />
                      <label
                        htmlFor='photo-upload'
                        className='cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors'
                      >
                        Choose Photo
                      </label>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className='mb-6'>
                    <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Enter your full name'
                      required
                    />
                  </div>

                  <hr className='my-6' />

                  {/* Action Buttons */}
                  <div className='flex justify-between gap-3'>
                    <button
                      type='button'
                      className='flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2'
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='flex-1 inline-flex justify-center rounded-md border border-transparent bg-[#F43F5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#af4053] focus:outline-none focus-visible:ring-2 focus-visible:bg-[#F43F5E] focus-visible:ring-offset-2'
                    >
                      Update Profile
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

UpdateUserModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  modalHandler: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({
    name: PropTypes.string,
    photo: PropTypes.string
  })
}

export default UpdateUserModal