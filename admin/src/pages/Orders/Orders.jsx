import React, { useState, useEffect } from 'react';
import './Orders.css';
import { url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Please login first");
                window.location.href = '/login';
                return;
            }

            const response = await axios.get(`${url}/api/order/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log("API Response:", response.data); // Debugging
            
            let ordersData = [];
            
            // Handle different response structures
            if (response.data.success && Array.isArray(response.data.data)) {
                ordersData = response.data.data;
            } else if (Array.isArray(response.data)) {
                ordersData = response.data;
            } else if (response.data.orders && Array.isArray(response.data.orders)) {
                ordersData = response.data.orders;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                ordersData = response.data.data;
            } else {
                console.warn("Unexpected API response structure:", response.data);
                toast.error("Unexpected data format received");
            }
            
            const sortedOrders = ordersData.sort((a, b) => 
                new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
            );
            
            setOrders(sortedOrders);
            
        } catch (error) {
            console.error("Error fetching orders:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response) {
                toast.error(`Error: ${error.response.status} - ${error.response.data?.message || 'Server error'}`);
            } else {
                toast.error("Network error - cannot connect to server");
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        if (!orderId) {
            toast.error("Invalid order ID");
            return;
        }

        try {
            setUpdatingOrderId(orderId);
            const token = localStorage.getItem('token');

            console.log("Updating order:", { orderId, status });

            let response;
            let errorMessage = "Failed to update order status";

            try {
                // Try POST to /api/order/status first
                response = await axios.post(
                    `${url}/api/order/status`, 
                    { 
                        orderId: orderId,
                        status: status 
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (firstError) {
                console.log("POST method failed, trying PUT...");
                
                try {
                    // Try PUT to /api/order/:id
                    response = await axios.put(
                        `${url}/api/order/${orderId}`, 
                        { status: status },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                } catch (secondError) {
                    console.log("PUT method failed, trying PATCH...");
                    
                    try {
                        // Try PATCH to /api/order/:id
                        response = await axios.patch(
                            `${url}/api/order/${orderId}`, 
                            { status: status },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                    } catch (thirdError) {
                        // If all attempts fail, throw the first error
                        throw firstError;
                    }
                }
            }

            console.log("Update response:", response.data);
            
            // Handle different success response formats
            if (response.data.success || response.status === 200 || response.status === 204) {
                toast.success("Order status updated successfully!");
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order._id === orderId ? { ...order, status } : order
                    )
                );
            } else {
                toast.error(response.data.message || "Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                
                if (error.response.status === 400) {
                    if (error.response.data?.errors) {
                        toast.error(`Validation error: ${JSON.stringify(error.response.data.errors)}`);
                    } else {
                        toast.error("Invalid request data");
                    }
                } else if (error.response.status === 401) {
                    toast.error("Session expired. Please login again.");
                    localStorage.removeItem('token');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else if (error.response.status === 403) {
                    toast.error("You don't have permission to update orders");
                } else if (error.response.status === 404) {
                    toast.error("Order not found");
                } else if (error.response.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error(`Server error: ${error.response.status}`);
                }
            } else if (error.request) {
                toast.error("No response from server - check your connection");
            } else {
                toast.error("Error updating order status");
            }
        } finally {
            setUpdatingOrderId(null);
        }
    };

    // Test function to check API connectivity
    const testOrderUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const testData = {
                orderId: "test-order-id",
                status: "Food Processing"
            };

            console.log("Testing order update API...");
            
            const response = await axios.post(`${url}/api/order/status`, testData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("Test API response:", response.data);
            toast.info("API is reachable - check console for details");
        } catch (error) {
            console.error("Test API error:", error);
            toast.error("API test failed - check console");
        }
    };

    // Format address object into a readable string
    const formatAddress = (address) => {
        if (!address) return 'No address provided';
        
        if (typeof address === 'string') return address;
        
        if (typeof address === 'object') {
            const parts = [
                address.firstName && address.lastName ? `${address.firstName} ${address.lastName}` : null,
                address.street,
                address.city,
                address.state,
                address.zipcode,
                address.country,
                address.phone ? `Phone: ${address.phone}` : null
            ].filter(Boolean);
            
            return parts.join(', ');
        }
        
        return 'Invalid address format';
    };

    // Format items array
    const formatItems = (items) => {
        if (!items || !Array.isArray(items)) return 'No items';
        
        return items.map(item => 
            `${item.name || 'Unknown Item'}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`
        ).join(', ');
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') {
            amount = parseFloat(amount) || 0;
        }
        return `$${amount.toFixed(2)}`;
    };

    // Format date - using both createdAt and date fields from your model
    const formatDate = (order) => {
        const dateString = order.createdAt || order.date;
        if (!dateString) return 'Unknown date';
        try {
            return new Date(dateString).toLocaleString();
        } catch (error) {
            return 'Invalid date';
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className='orders'>
            <div className="orders-header">
                <h2>Order History</h2>
                <div className="order-actions">
                    <button onClick={fetchOrders} className="refresh-btn" disabled={loading}>
                        {loading ? 'Refreshing...' : 'Refresh Orders'}
                    </button>
                    <button onClick={testOrderUpdate} className="test-btn">
                        Test API
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="loading">Loading orders...</div>
            ) : (
                <div className="order-list">
                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <p>No orders found</p>
                            <button onClick={fetchOrders} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    ) : (
                        orders.map((order, index) => (
                            <div key={order._id || `order-${index}`} className="order-item">
                                <div className="order-header">
                                    <div className="order-title">
                                        <h3>Order #{order._id ? order._id.substring(0, 8) : `Order-${index + 1}`}</h3>
                                        <small>ID: {order._id || 'No ID'}</small>
                                    </div>
                                    <div className="status-section">
                                        <strong>Status: </strong>
                                        <select 
                                            value={order.status || 'Food Processing'} 
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                            disabled={updatingOrderId === order._id}
                                            className="status-select"
                                        >
                                            <option value="Food Processing">Food Processing</option>
                                            <option value="Out for delivery">Out for delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        {updatingOrderId === order._id && (
                                            <span className="updating">Updating...</span>
                                        )}
                                    </div>
                                </div>
                                <div className="order-details">
                                    <p><strong>Items:</strong> {formatItems(order.items)}</p>
                                    <p><strong>Total Amount:</strong> {formatCurrency(order.amount)}</p>
                                    <p><strong>Address:</strong> {formatAddress(order.address)}</p>
                                    <p><strong>Date:</strong> {formatDate(order)}</p>
                                    <p><strong>Payment:</strong> 
                                        <span className={order.payment ? 'payment-paid' : 'payment-pending'}>
                                            {order.payment ? ' Paid ✅' : ' Pending ❌'}
                                        </span>
                                    </p>
                                    {order.status && (
                                        <p><strong>Current Status:</strong> 
                                            <span className={`status-badge status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;