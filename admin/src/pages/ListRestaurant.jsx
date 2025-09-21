import React, { useEffect, useState } from 'react';
import '../pages/List/List.css';
import { url } from '../assets/assets'
import axios from 'axios';
import { toast } from 'react-toastify';

const ListRestaurant = () => {
    const [list, setList] = useState([]);

    const fetchList = async () => {
        const response = await axios.get(`${url}/api/restaurant/list`);
        if (response.data.success) {
            setList(response.data.data);
        } else {
            toast.error("Error fetching restaurant list");
        }
    };

    const removeRestaurant = async (restaurantId) => {
        const response = await axios.post(`${url}/api/restaurant/remove`, {
            id: restaurantId
        });
        await fetchList();
        if (response.data.success) {
            toast.success(response.data.message);
        } else {
            toast.error("Error removing restaurant");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className='list add flex-col'>
            <p>All Restaurants List</p>
            <div className='list-table'>
                <div className="list-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Description</b>
                    <b>Address</b>
                    <b>Action</b>
                </div>
                {list.map((item, index) => {
                    return (
                        <div key={index} className='list-table-format'>
                            <img src={`${url}/images/` + item.image} alt="" />
                            <p>{item.name}</p>
                            <p>{item.description.slice(0, 30) + "..."}</p>
                            <p>{item.address}</p>
                            <p className='cursor' onClick={() => removeRestaurant(item._id)}>x</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ListRestaurant;