// Enhanced Login.jsx with more features
import React, { useState } from 'react';
import './login.css';
import { assets, url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = ({ setUser }) => {
    const [data, setData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
        if (!data.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = "Email is invalid";
        }
        
        if (!data.password) {
            newErrors.password = "Password is required";
        } else if (data.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const response = await axios.post(`${url}/api/user/login`, data);
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                toast.success("Login successful!");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className='login'>
            <form className='login-form flex-col' onSubmit={onSubmitHandler}>
                <div className="login-header">
                    <img src={assets.logo} alt="Logo" />
                    <h2>Admin Panel</h2>
                    <p>Sign in to your account</p>
                </div>
                
                <div className='login-input flex-col'>
                    <p>Email Address</p>
                    <input 
                        name='email' 
                        onChange={onChangeHandler} 
                        value={data.email} 
                        type="email" 
                        placeholder='your@email.com' 
                        className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className='login-input flex-col'>
                    <p>Password</p>
                    <div className="password-input-container">
                        <input 
                            name='password' 
                            onChange={onChangeHandler} 
                            value={data.password} 
                            type={showPassword ? "text" : "password"} 
                            placeholder='Enter your password' 
                            className={errors.password ? 'error' : ''}
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                
                <div className="forgot-password">
                    <a href="#forgot">Forgot your password?</a>
                </div>
                
                <button 
                    type='submit' 
                    className={`login-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? '' : 'SIGN IN'}
                </button>
                
                {/* Demo credentials hint */}
                <div style={{marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontSize: '12px', color: '#666'}}>
                    <strong>Demo Credentials:</strong><br/>
                    Admin: admin@foodapp.com / admin123<br/>
                    Restaurant Admin: restaurant@foodapp.com / rest123
                </div>
            </form>
        </div>
    );
};

export default Login;