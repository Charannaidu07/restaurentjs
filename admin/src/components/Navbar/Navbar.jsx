import React from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="Logo" />
      <div className="navbar-right">
        <img className='profile' src={assets.profile_image} alt="Profile" />
        <button onClick={logout} className='logout-btn'>Logout</button>
      </div>
    </div>
  );
};

export default Navbar;
