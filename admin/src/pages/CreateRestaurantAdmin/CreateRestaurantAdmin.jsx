import React, { useState, useEffect } from 'react';
import '../Add/Add.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { url } from '../../assets/assets';

const CreateRestaurantAdmin = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        restaurantId: ""
    });
    const [loading, setLoading] = useState(false);

    const fetchRestaurants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${url}/api/restaurant/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setRestaurants(response.data.data);
                if (response.data.data.length > 0) {
                    setData(prevData => ({ ...prevData, restaurantId: response.data.data[0]._id }));
                }
            }
        } catch (error) {
            toast.error("Error fetching restaurants");
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${url}/api/user/create-restaurant-admin`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success("Restaurant admin created successfully");
                setData({
                    name: "",
                    email: "",
                    password: "",
                    restaurantId: ""
                });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating restaurant admin");
        } finally {
            setLoading(false);
        }
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    return (
        <div className='add'>
            <form className='flex-col' onSubmit={onSubmitHandler}>
                <h3>Create Restaurant Admin</h3>
                
                <div className='add-product-name flex-col'>
                    <p>Name</p>
                    <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Type here' required />
                </div>
                
                <div className='add-product-description flex-col'>
                    <p>Email</p>
                    <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Type here' required />
                </div>
                
                <div className='add-product-name flex-col'>
                    <p>Password</p>
                    <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Type here' required />
                </div>
                
                <div className='add-restaurant flex-col'>
                    <p>Select Restaurant</p>
                    <select name='restaurantId' onChange={onChangeHandler} value={data.restaurantId} required>
                        {restaurants.length > 0 ? (
                            restaurants.map(restaurant => (
                                <option key={restaurant._id} value={restaurant._id}>
                                    {restaurant.name}
                                </option>
                            ))
                        ) : (
                            <option value="">No restaurants available</option>
                        )}
                    </select>
                </div>
                
                <button type='submit' className='add-btn' disabled={loading}>
                    {loading ? 'CREATING...' : 'CREATE ADMIN'}
                </button>
            </form>
        </div>
    );
};

export default CreateRestaurantAdmin;