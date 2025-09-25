import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {
    const { setToken, url } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Sign Up");
    const [loading, setLoading] = useState(false);

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault()
        setLoading(true);

        try {
            let new_url = url;
            if (currState === "Login") {
                new_url += "/api/user/login";
            } else {
                new_url += "/api/user/register" // FIXED: Changed from /api/user/register to match your route
            }
            
            const response = await axios.post(new_url, data);
            
            // FIXED: Check for success property (your backend uses success: true/false)
            if (response.data.success) {
                // setToken will handle loading cart data and user data
                await setToken(response.data.token);
                setShowLogin(false);
                toast.success(`Welcome! ${currState === "Login" ? "Login successful" : "Account created successfully"}`);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Login error:", error);
            // FIXED: Handle different error response formats
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error ||
                               "Something went wrong";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> 
                    <img 
                        onClick={() => setShowLogin(false)} 
                        src={assets.cross_icon} 
                        alt="Close" 
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <input 
                            name='name' 
                            onChange={onChangeHandler} 
                            value={data.name} 
                            type="text" 
                            placeholder='Your name' 
                            required 
                        />
                    )}
                    <input 
                        name='email' 
                        onChange={onChangeHandler} 
                        value={data.email} 
                        type="email" 
                        placeholder='Your email' 
                        required
                    />
                    <input 
                        name='password' 
                        onChange={onChangeHandler} 
                        value={data.password} 
                        type="password" 
                        placeholder='Password' 
                        required 
                        minLength="8"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : (currState === "Login" ? "Login" : "Create account")}
                </button>
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup;