import { useState } from "react";
import AddRoomForm from "../../../components/Form/AddRoomForm";
import useAuth from "../../../hooks/useAuth";
import { imageUpload } from "../../../api/utils";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";



const AddRoom = () => {

    const { user } = useAuth()
    const axiosSecure=useAxiosSecure()
    const navigate=useNavigate()
    const [loading, setLoading]=useState(false)
    


    const[imagePreview, setImagePreview]=useState()
    const[imageText, setImageText]=useState('upload Image')

    const [dates, setDates] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection'

    })

    const {mutateAsync}=useMutation({

        mutationFn:async (roomData)=>{
            const{data}=await axiosSecure.post('/room', roomData);

            return data;

        },
        onSuccess:()=>{
            console.log('data saved successfullyyy');
            toast.success('room Added Successfully')
            navigate('/dashboard/my-listings')

            setLoading(false)
            
        }
    })

    //date range handler
    const handleDates = (item) => {
        console.log(item);
        setDates(item.selection);

    }

    //form handler
    const handleSubmit = async (e) => {
        setLoading(true)
        e.preventDefault();
        const form = e.target;

        const location = form.location.value;
        const category = form.category.value;
        const title = form.title.value;
        const from=dates.startDate;
        const to=dates.endDate;
        const price = parseFloat(form.price.value);
        const guest = parseInt(form.total_guest.value);
        const bedrooms = parseInt(form.bedrooms.value);
        const bathrooms = parseInt(form.bathrooms.value);
        const description = form.description.value;
        const image = form.image.files[0]; // for file input

        const host = {
            name: user?.displayName,
            email: user?.email,
            image: user?.photoURL,

        }

        try {

            const image_url = await imageUpload(image)
            console.log(image_url);

            const roomData = {
                location,
                category,
                title,
                from,
                to,
                price, 
                guest, 
                bedrooms, 
                bathrooms, 
                description, 
                image: image_url, 
                host
            }
            console.table(roomData)

            //post request to server
            await mutateAsync(roomData)


        } catch (error) {
            //
            console.log(error.message);
            toast.error(error.message)
                 setLoading(false)


        }

    }

    //handle image change
    const handleImage=(image)=>{
        setImagePreview(URL.createObjectURL(image))
        setImageText(image.name)

    }

    return (
        <div>
            <Helmet>
                <title>Add Room || Dashboard</title>
            </Helmet>
            
            <AddRoomForm dates={dates} handleDates={handleDates} handleSubmit={handleSubmit}
            setImagePreview={setImagePreview}
            imagePreview={imagePreview}
            handleImage={handleImage}
            imageText={imageText}
            loading={loading}
            setLoading={setLoading}
            />
        </div>
    );
};

export default AddRoom;