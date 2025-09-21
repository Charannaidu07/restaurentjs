import React, { useState } from 'react';
import '../pages/Add/Add.css'; // Reuse the existing CSS for the form layout
import { assets, url } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddRestaurant = () => {
    const [image, setImage] = useState(false);
    const [data, setData] = useState({
        name: "",
        description: "",
        address: ""
    });

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        if (!image) {
            toast.error('Image not selected');
            return null;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("address", data.address);
        formData.append("image", image);
        
        const response = await axios.post(`${url}/api/restaurant/add`, formData);
        
        if (response.data.success) {
            toast.success(response.data.message);
            setData({
                name: "",
                description: "",
                address: ""
            });
            setImage(false);
        } else {
            toast.error(response.data.message);
        }
    };

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <div className='add-img-upload flex-col'>
                    <p>Upload Restaurant Image</p>
                    <input onChange={(e) => { setImage(e.target.files[0]); e.target.value = '' }} type="file" accept="image/*" id="restaurant-image" hidden />
                    <label htmlFor="restaurant-image">
                        <img src={!image ? assets.upload_area : URL.createObjectURL(image)} alt="" />
                    </label>
                </div>
                <div className='add-product-name flex-col'>
                    <p>Restaurant name</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Type here' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Restaurant description</p>
                    <textarea name='description' onChange={onChangeHandler} value={data.description} type="text" rows={6} placeholder='Write content here' required />
                </div>
                <div className='add-product-description flex-col'>
                    <p>Restaurant address</p>
                    <input name='address' onChange={onChangeHandler} value={data.address} type="text" placeholder='Type here' required />
                </div>
                <button type='submit' className='add-btn' >ADD RESTAURANT</button>
            </form>
        </div>
    );
};

export default AddRestaurant;