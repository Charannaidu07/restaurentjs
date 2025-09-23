import React, { useContext, useEffect, useState } from 'react'
import './MyOrders.css'
import axios from 'axios'
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const { url, token, currency, user } = useContext(StoreContext);

  const fetchOrders = async () => {
    const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
    setData(response.data.data)
  }

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token])

  return (
    <div className='my-orders'>
      <div className="profile-column">
        <div className="profile-placeholder">
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <p className="profile-name">{user?.name || "User"}</p>
        <p className="profile-email">{user?.email || "user@example.com"}</p>
      </div>

      <div className="orders-column">
        <h2>My Orders</h2>
        <div className="container">
          {data.map((order, index) => {
            return (
              <div key={index} className='my-orders-order'>
                <img src={assets.parcel_icon} alt="" />
                <p>{order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  }
                  else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}</p>
                <p>{currency}{order.amount}.00</p>
                <p>Items: {order.items.length}</p>
                <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                <button onClick={fetchOrders}>Track Order</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
