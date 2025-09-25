import React, { useState, useEffect } from 'react';
import './List.css';
import { url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {
    const [list, setList] = useState([]);

    const fetchList = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login first");
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`${url}/api/food/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching food list:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                toast.error("Error fetching food list");
            }
        }
    };

    const removeFood = async (foodId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${url}/api/food/remove`, { id: foodId }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                toast.success("Food item removed successfully");
                fetchList();
            } else {
                toast.error("Error removing food item");
            }
        } catch (error) {
            console.error("Error removing food:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else {
                toast.error("Error removing food item");
            }
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className='list'>
            <h2>All Food Items</h2>
            <div className="list-table">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((food, index) => (
                            <tr key={index}>
                                <td><img src={`${url}/images/${food.image}`} alt={food.name} /></td>
                                <td>{food.name}</td>
                                <td>{food.description}</td>
                                <td>${food.price}</td>
                                <td>{food.category}</td>
                                <td>
                                    <button onClick={() => removeFood(food._id)} className='remove-btn'>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default List;