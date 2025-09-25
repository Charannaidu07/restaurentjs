// MyOrders.jsx - Enhanced version
import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { url, token, currency, user } = useContext(StoreContext);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (!token) {
      setError('No token available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        url + "/api/order/userorders", 
        {}, // Empty body - userId will come from token
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        const sortedData = response.data.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setData(sortedData);
        console.log('Orders fetched successfully:', response.data.orders.length);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => navigate('/'), 2000);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to fetch orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please login to view your orders');
    }
  }, [token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Food Processing':
        return '#007bff';
      case 'Out for delivery':
        return '#ffc107';
      case 'Delivered':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className='my-orders'>
        <div className="loading-container">
          <p>Loading your orders...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !token) {
    return (
      <div className='my-orders'>
        <div className="my-orders-error">
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className='my-orders'>
      <div className="profile-column">
        <div className="profile-placeholder">
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <p className="profile-name">{user?.name || "User"}</p>
        <p className="profile-email">{user?.email || "user@example.com"}</p>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-button">Retry</button>
          </div>
        )}
      </div>

      <div className="orders-column">
        <div className="orders-header">
          <h2>My Orders</h2>
          <button onClick={fetchOrders} className="refresh-button">
            Refresh
          </button>
        </div>
        
        <div className="container">
          {data.length === 0 && !error ? (
            <div className="no-orders">
              <p>No orders found</p>
              <p className="no-orders-subtext">You haven't placed any orders yet.</p>
              <button onClick={() => navigate('/')} className="shop-button">
                Start Shopping
              </button>
            </div>
          ) : (
            data.map((order, index) => (
              <div key={order._id || index} className='my-orders-order'>
                <img src={assets.parcel_icon} alt="order" />
                <div className="order-details">
                  <p className="order-items">
                    {order.items.map((item, index) => (
                      <span key={index}>
                        {item.name} x {item.quantity}
                        {index < order.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                  <div className="order-meta">
                    <span className="order-amount">{currency}{order.amount}.00</span>
                    <span className="order-items-count">Items: {order.items.length}</span>
                    <span className="order-status">
                      <span 
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      ></span>
                      <b>{order.status}</b>
                    </span>
                    <span className="order-date">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders;