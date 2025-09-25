import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets'; // Fixed path
import { NavLink } from 'react-router-dom';

const Sidebar = ({ userRole }) => {
    return (
        <div className='sidebar'>
            <div className="sidebar-options">
                {/* Admin Only Options */}
                {(userRole === 'admin') && (
                    <>
                        <NavLink to='/add-restaurant' className={({ isActive }) => 
                            isActive ? "sidebar-option active" : "sidebar-option"
                        }>
                            <img src={assets.add_icon} alt="" />
                            <p>Add Restaurant</p>
                        </NavLink>
                        <NavLink to='/list-restaurant' className={({ isActive }) => 
                            isActive ? "sidebar-option active" : "sidebar-option"
                        }>
                            <img src={assets.order_icon} alt="" />
                            <p>List Restaurants</p>
                        </NavLink>
                        <NavLink to='/create-restaurant-admin' className={({ isActive }) => 
                            isActive ? "sidebar-option active" : "sidebar-option"
                        }>
                            <img src={assets.add_icon} alt="" />
                            <p>Create Restaurant Admin</p>
                        </NavLink>
                    </>
                )}
                
                {/* Common Options for Admin and Restaurant Admin */}
                <NavLink to='/add' className={({ isActive }) => 
                    isActive ? "sidebar-option active" : "sidebar-option"
                }>
                    <img src={assets.add_icon} alt="" />
                    <p>Add Food Items</p>
                </NavLink>
                <NavLink to='/list' className={({ isActive }) => 
                    isActive ? "sidebar-option active" : "sidebar-option"
                }>
                    <img src={assets.order_icon} alt="" />
                    <p>List Food Items</p>
                </NavLink>
                <NavLink to='/orders' className={({ isActive }) => 
                    isActive ? "sidebar-option active" : "sidebar-option"
                }>
                    <img src={assets.order_icon} alt="" />
                    <p>Orders</p>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;