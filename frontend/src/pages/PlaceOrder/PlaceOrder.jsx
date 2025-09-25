import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const [payment, setPayment] = useState("cod")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  const { getTotalCartAmount, token, food_list, cartItems, url, setCartItems, currency, deliveryCharge, user } = useContext(StoreContext);
  const navigate = useNavigate();

  // Redirect if not authenticated or cart is empty
  useEffect(() => {
    if (!token) {
      toast.error("To place an order, please sign in first");
      navigate('/cart');
      return;
    }
    
    if (getTotalCartAmount() === 0) {
      toast.error("Your cart is empty");
      navigate('/cart');
    }

    // Pre-fill user data if available
    if (user) {
      setData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || "",
        lastName: user.name?.split(' ')[1] || "",
        email: user.email || ""
      }));
    }
  }, [token, getTotalCartAmount, navigate, user]);

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to place an order");
      return;
    }

    if (getTotalCartAmount() === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    // Create separate data structures for different endpoints
    const razorpayOrderData = {
      amount: Math.round((getTotalCartAmount() + deliveryCharge) * 100), // Convert to paise
      currency: "INR"
    };

    const fullOrderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + deliveryCharge,
      paymentMethod: payment,
      userId: user?._id // Include userId for order creation
    };

    try {
      if (payment === "razorpay") {
        // Razorpay payment flow - Send only amount and currency
        console.log('Creating Razorpay order with data:', razorpayOrderData);
        
        const orderResponse = await axios.post(
          url + "/api/order/razorpay-create-order",
          razorpayOrderData, // Send only amount and currency
          { headers: { token } }
        );
        
        console.log('Razorpay order response:', orderResponse.data);

        if (orderResponse.data.success) {
          const { order } = orderResponse.data;
          
          // Check if Razorpay is loaded
          if (!window.Razorpay) {
            toast.error("Payment system loading, please try again in a moment");
            setLoading(false);
            return;
          }

          const options = {
            key: "rzp_test_RKFuanS5TWeeN2",
            amount: order.amount,
            currency: order.currency,
            name: "Tomato",
            description: "Food Order",
            order_id: order.id,
            handler: async function (response) {
              try {
                console.log('Payment successful:', response);
                
                // Verify payment and create order
                const verificationResponse = await axios.post(
                  url + "/api/order/razorpay-verify-payment",
                  {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    orderData: fullOrderData, // Send full order data here
                  },
                  { headers: { token } }
                );

                if (verificationResponse.data.success) {
                  navigate("/myorders");
                  toast.success("Order placed successfully!");
                  setCartItems({});
                } else {
                  toast.error("Payment verification failed");
                }
              } catch (error) {
                console.error("Payment verification error:", error);
                toast.error("Payment verification failed");
              }
            },
            prefill: {
              name: data.firstName + " " + data.lastName,
              email: data.email,
              contact: data.phone,
            },
            theme: {
              color: "#E21818"
            },
            notes: {
              address: "Food Order"
            }
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.on('payment.failed', function (response) {
            console.error('Payment failed:', response);
            toast.error("Payment failed. Please try again.");
          });
          
          rzp1.open();
        } else {
          toast.error(orderResponse.data.message || "Failed to create payment order");
        }
      } else {
        // COD payment flow
        console.log('Placing COD order with data:', fullOrderData);
        
        let response = await axios.post(
          url + "/api/order/placecod", 
          fullOrderData, 
          { headers: { token } }
        );
        
        console.log('COD order response:', response.data);
        
        if (response.data.success) {
          navigate("/myorders");
          toast.success("Order placed successfully!");
          setCartItems({});
        } else {
          toast.error(response.data.message || "Failed to place order");
        }
      }
    } catch (error) {
      console.error("Order placement error:", error);
      
      // Enhanced error handling
      if (error.response) {
        console.log('Error response data:', error.response.data);
        console.log('Error response status:', error.response.status);
        
        if (error.response.status === 401) {
          toast.error("Session expired. Please login again.");
          navigate('/login');
        } else if (error.response.status === 404) {
          toast.error("Service temporarily unavailable. Please try again later.");
          console.error("Endpoint not found. Check backend routes.");
        } else if (error.response.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Improved Razorpay loader
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          console.log("Razorpay SDK loaded successfully");
          resolve(true);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay SDK");
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    // Load Razorpay when component mounts if user might use it
    if (payment === "razorpay" || user) {
      loadRazorpay();
    }
  }, [payment, user]);

  if (!token || getTotalCartAmount() === 0) {
    return (
      <div className='place-order'>
        <div className="place-order-loading">
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-field">
          <input 
            type="text" 
            name='firstName' 
            onChange={onChangeHandler} 
            value={data.firstName} 
            placeholder='First name' 
            required 
            disabled={loading}
          />
          <input 
            type="text" 
            name='lastName' 
            onChange={onChangeHandler} 
            value={data.lastName} 
            placeholder='Last name' 
            required 
            disabled={loading}
          />
        </div>
        <input 
          type="email" 
          name='email' 
          onChange={onChangeHandler} 
          value={data.email} 
          placeholder='Email address' 
          required 
          disabled={loading}
        />
        <input 
          type="text" 
          name='street' 
          onChange={onChangeHandler} 
          value={data.street} 
          placeholder='Street' 
          required 
          disabled={loading}
        />
        <div className="multi-field">
          <input 
            type="text" 
            name='city' 
            onChange={onChangeHandler} 
            value={data.city} 
            placeholder='City' 
            required 
            disabled={loading}
          />
          <input 
            type="text" 
            name='state' 
            onChange={onChangeHandler} 
            value={data.state} 
            placeholder='State' 
            required 
            disabled={loading}
          />
        </div>
        <div className="multi-field">
          <input 
            type="text" 
            name='zipcode' 
            onChange={onChangeHandler} 
            value={data.zipcode} 
            placeholder='Zip code' 
            required 
            disabled={loading}
          />
          <input 
            type="text" 
            name='country' 
            onChange={onChangeHandler} 
            value={data.country} 
            placeholder='Country' 
            required 
            disabled={loading}
          />
        </div>
        <input 
          type="text" 
          name='phone' 
          onChange={onChangeHandler} 
          value={data.phone} 
          placeholder='Phone' 
          required 
          disabled={loading}
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{currency}{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>{currency}{getTotalCartAmount() === 0 ? 0 : deliveryCharge}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{currency}{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + deliveryCharge}</b>
            </div>
          </div>
        </div>
        <div className="payment">
          <h2>Payment Method</h2>
          <div onClick={() => !loading && setPayment("cod")} className="payment-option">
            <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="" />
            <p>COD (Cash on delivery)</p>
          </div>
          <div onClick={() => !loading && setPayment("razorpay")} className="payment-option">
            <img src={payment === "razorpay" ? assets.checked : assets.un_checked} alt="" />
            <p>Razorpay (Credit / Debit)</p>
          </div>
        </div>
        <button 
          className={`place-order-submit ${loading ? 'loading' : ''}`} 
          type='submit'
          disabled={loading}
        >
          {loading ? 'Processing...' : 
           payment === "cod" ? "Place Order" : "Proceed To Payment"}
        </button>
        
        {loading && (
          <div className="loading-message">
            <p>Please wait while we process your order...</p>
          </div>
        )}
      </div>
    </form>
  )
}

export default PlaceOrder;