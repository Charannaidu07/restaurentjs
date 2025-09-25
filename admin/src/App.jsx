// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import AddRestaurant from './pages/AddRestaurant';
import ListRestaurant from './pages/ListRestaurant';
import CreateRestaurantAdmin from './pages/CreateRestaurantAdmin/CreateRestaurantAdmin';
import Login from './pages/login/login';
import Navbar from './components/Navbar/Navbar';
import { url } from './assets/assets';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${url}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Auth error:', error);
            localStorage.removeItem('token');
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    return (
        <BrowserRouter>
            <ToastContainer autoClose={2000} />
            <div className="App">
                {user ? (
                    <>
                        <Navbar />
                        <hr />
                        <div className="app-content">
                            <Sidebar userRole={user.role} />
                            <div className="main-content">
                                <Routes>
                                    <Route path='/add' element={<Add />} />
                                    <Route path='/list' element={<List />} />
                                    <Route path='/orders' element={<Orders />} />
                                    {user.role === 'admin' && (
                                        <>
                                            <Route path='/add-restaurant' element={<AddRestaurant />} />
                                            <Route path='/list-restaurant' element={<ListRestaurant />} />
                                            <Route path='/create-restaurant-admin' element={<CreateRestaurantAdmin />} />
                                        </>
                                    )}
                                    <Route path='*' element={<Navigate to="/add" />} />
                                </Routes>
                            </div>
                        </div>
                    </>
                ) : (
                    <Routes>
                        <Route path='/login' element={<Login setUser={setUser} />} />
                        <Route path='*' element={<Navigate to="/login" />} />
                    </Routes>
                )}
            </div>
        </BrowserRouter>
    );
}

export default App;
