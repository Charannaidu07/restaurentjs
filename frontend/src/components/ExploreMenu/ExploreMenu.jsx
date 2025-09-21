import React, { useEffect, useState } from 'react'
import './ExploreMenu.css'
import axios from 'axios';
import { url } from '../../assets/assets';
import { toast } from 'react-toastify';

const ExploreMenu = ({ category, setCategory, restaurants, setRestaurants }) => {

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${url}/api/restaurant/list`);
      if (response.data.success) {
        setRestaurants(response.data.data);
      } else {
        toast.error("Error fetching restaurants");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Error fetching restaurants");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our restaurants</h1>
      <p className='explore-menu-text'>Choose from a diverse menu featuring a delectable array of dishes from various restaurants. Our mission is to satisfy your cravings and elevate your dining experience, one delicious meal at a time.</p>
      <div className="explore-menu-list">
        {restaurants.map((item, index) => (
            <div onClick={() => setCategory(prev => prev === item._id ? "All" : item._id)} key={index} className='explore-menu-list-item'>
              <img src={`${url}/images/${item.image}`} className={category === item._id ? "active" : ""} alt="" />
              <p>{item.name}</p>
            </div>
          ))}
      </div>
      <hr />
    </div>
  )
}

export default ExploreMenu;