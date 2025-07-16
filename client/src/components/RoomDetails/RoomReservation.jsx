import PropTypes from 'prop-types'
import Button from '../Shared/Button/Button'
import { useState } from 'react'
import { DateRange } from 'react-date-range'
import { differenceInCalendarDays } from 'date-fns'
import BookingModal from '../Modal/BookingModal'
import useAuth from '../../hooks/useAuth'
const RoomReservation = ({ room }) => {
console.log(room);

const {user}=useAuth()

  const[isOpen, setIsOpen]=useState(false)
  console.log(room.to, room.from);
  
  console.log('start date->', new Date(room.from));
  

  const [state, setState] = useState([
    {
      startDate: new Date(room.from),
      endDate: new Date(room.to),
      key: 'selection',
    },
  ])

  const closeModal=()=>{
    setIsOpen(false)
  }


  const totalDays=parseInt(
    differenceInCalendarDays(new Date(room.to),  new Date(room.from))
  )
  
const totalPrice=totalDays * room?.price;
  // console.log(totalDays,totalPrice);
  
 
  

  return (
    <div className='rounded-xl border-[1px] border-neutral-200 overflow-hidden bg-white'>
      <div className='flex items-center gap-1 p-4'>
        <div className='text-2xl font-semibold'>$ {room?.price}</div>
        <div className='font-light text-neutral-600'>/night</div>
      </div>
      <hr />
      <div className='flex justify-center'>
        {/* Calender */}
        <DateRange
          showDateDisplay={false}
          rangeColors={['#F6536D']}
          editableDateInputs={true}
          onChange={item =>
         {setState([{
      startDate: new Date(room.from),
      endDate: new Date(room.to),
      key: 'selection',
    }])}
  
  }
          moveRangeOnFirstSelection={false}
          ranges={state}
        />
      </div>
      <hr />

      {/* reserve button */}
      <div className='p-4'>
        <Button onClick={()=>setIsOpen(true)} label={'Reserve'} />
      </div>
      {/* modal */}
      <BookingModal isOpen={isOpen} closeModal={closeModal} bookingInfo={{...room, price:totalPrice, totalDays, guest:{name: user?.displayName}}} />
      <hr />
      <div className='p-4 flex items-center justify-between font-semibold text-lg'>
        <div>Total</div>
        <div>${totalPrice}</div>
      </div>

      
    </div>
  )
}

RoomReservation.propTypes = {
  room: PropTypes.object,
}

export default RoomReservation
