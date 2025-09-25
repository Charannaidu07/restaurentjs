import React, { useState } from 'react';
import '../pages/Add/Add.css'; // Reuse the existing CSS for the form layout
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets, url } from '../assets/assets'; // Fixed path
import { useNavigate } from 'react-router-dom'; // Add navigation for redirect

const AddRestaurant = () => {
    const [image, setImage] = useState(false);
    const [loading, setLoading] = useState(false); // Add loading state
    const [data, setData] = useState({
        name: "",
        description: "",
        address: ""
    });

    const navigate = useNavigate();

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!image) {
            toast.error('Image not selected');
            setLoading(false);
            return null;
        }

        // Get the token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Please log in to add a restaurant');
            setLoading(false);
            navigate('/login'); // Redirect to login page
            return;
        }

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("address", data.address);
        formData.append("image", image);
        
        try {
            const response = await axios.post(`${url}/api/restaurant/add`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    description: "",
                    address: ""
                });
                setImage(false);
                // Optional: Redirect to restaurants list or dashboard
                // navigate('/admin/restaurants');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error adding restaurant:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token'); // Clear invalid token
                navigate('/login');
            } else if (error.response?.status === 403) {
                toast.error('You do not have permission to add restaurants');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to add restaurant. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    
    if (!token) {
        return (
            <div className='add'>
                <div className='flex-col' style={{textAlign: 'center', padding: '50px'}}>
                    <h3>Access Denied</h3>
                    <p>Please log in to add a restaurant.</p>
                    <button 
                        className='add-btn' 
                        onClick={() => navigate('/login')}
                        style={{marginTop: '20px'}}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <h3>Add New Restaurant</h3>
                
                <div className='add-img-upload flex-col'>
                    <p>Upload Restaurant Image</p>
                    <input 
                        onChange={(e) => { 
                            setImage(e.target.files[0]); 
                            e.target.value = ''; // Reset input to allow selecting same file again
                        }} 
                        type="file" 
                        accept="image/*" 
                        id="restaurant-image" 
                        hidden 
                        disabled={loading}
                    />
                    <label htmlFor="restaurant-image">
                        <img 
                            src={!image ? assets.upload_area : URL.createObjectURL(image)} 
                            alt="Restaurant preview" 
                            style={loading ? {opacity: 0.7} : {}} 
                        />
                    </label>
                    {loading && <p>Uploading...</p>}
                </div>
                
                <div className='add-product-name flex-col'>
                    <p>Restaurant name</p>
                    <input 
                        name='name' 
                        onChange={onChangeHandler} 
                        value={data.name} 
                        type="text" 
                        placeholder='Type here' 
                        required 
                        disabled={loading}
                    />
                </div>
                
                <div className='add-product-description flex-col'>
                    <p>Restaurant description</p>
                    <textarea 
                        name='description' 
                        onChange={onChangeHandler} 
                        value={data.description} 
                        type="text" 
                        rows={6} 
                        placeholder='Write content here' 
                        required 
                        disabled={loading}
                    />
                </div>
                
                <div className='add-product-description flex-col'>
                    <p>Restaurant address</p>
                    <input 
                        name='address' 
                        onChange={onChangeHandler} 
                        value={data.address} 
                        type="text" 
                        placeholder='Type here' 
                        required 
                        disabled={loading}
                    />
                </div>
                
                <button 
                    type='submit' 
                    className='add-btn' 
                    disabled={loading}
                >
                    {loading ? 'ADDING RESTAURANT...' : 'ADD RESTAURANT'}
                </button>
            </form>
        </div>
    );
};

export default AddRestaurant;