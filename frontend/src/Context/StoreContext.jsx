import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000";

  const [food_list, setFoodList] = useState([]); 
  const [menu_list, setMenuList] = useState([]);
  const [cartItems, setCartItems] = useState({}); 
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const currency = "₹";
  const deliveryCharge = 50;

  // Set up axios interceptor for authentication
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          config.headers.token = token; // For backward compatibility
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const clearInvalidToken = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setUser(null);
  };

  // Cart functions
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(url + "/api/cart/add", { itemId });
      } catch (err) {
        console.error("Error adding to cart:", err);
        if (err.response?.status === 401) {
          clearInvalidToken();
        }
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });

    if (token) {
      try {
        await axios.post(url + "/api/cart/remove", { itemId });
      } catch (err) {
        console.error("Error removing from cart:", err);
        if (err.response?.status === 401) {
          clearInvalidToken();
        }
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = food_list.find((product) => product._id === itemId);
      if (itemInfo) {
        totalAmount += itemInfo.price * cartItems[itemId];
      }
    }
    return totalAmount;
  };

  // Fetch food items - FIXED: Handle both public and authenticated access
  const fetchFoodList = async () => {
    try {
      console.log("Fetching food list...");
      const response = await axios.get(url + "/api/food/list");
      
      if (response.data && response.data.data) {
        setFoodList(response.data.data);
        console.log("Fetched food list successfully:", response.data.data.length, "items");
      } else {
        console.warn("Unexpected response format:", response.data);
        setFoodList([]);
      }
    } catch (err) {
      console.error("Error fetching food list:", err);
      
      // If unauthorized, try without authentication or use fallback
      if (err.response?.status === 401) {
        console.log("Endpoint requires authentication, will retry after login");
        // Don't set food_list here - it will be fetched after login
      } else {
        // For other errors, set empty array
        setFoodList([]);
      }
    }
  };

  // Alternative: Fetch food list with token (for authenticated users)
  const fetchAuthenticatedFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data && response.data.data) {
        setFoodList(response.data.data);
        return true;
      }
    } catch (err) {
      console.error("Error fetching authenticated food list:", err);
    }
    return false;
  };

  const fetchMenuList = async () => {
    try {
      const response = await axios.get(url + "/api/food/menulist");
      if (response.data && response.data.data) {
        setMenuList(response.data.data);
        console.log("Fetched menu list successfully");
      }
    } catch (err) {
      console.error("Error fetching menu list:", err);
      
      // Fallback: create menu from food categories
      const categories = food_list.length > 0 
        ? [...new Set(food_list.map((item) => item.category))].filter(Boolean)
        : ["All"];
      
      const fallbackMenu = categories.map((category) => ({
        menu_name: category,
        menu_image: "/images/default.png",
      }));
      setMenuList(fallbackMenu);
    }
  };

  // Load cart data
  const loadCartData = async () => {
    if (!token) {
      console.warn("No token available for cart data");
      setCartItems({});
      return;
    }
    
    try {
      const response = await axios.post(url + "/api/cart/get", {});
      setCartItems(response.data.cartData || {});
      console.log("Cart data loaded successfully");
    } catch (err) {
      console.error("Error loading cart data:", err);
      if (err.response?.status === 401) {
        clearInvalidToken();
      }
    }
  };

  // Validate token
  const validateToken = async (userToken) => {
    if (!userToken) return false;
    
    try {
      // Try user endpoint first
      const response = await axios.get(url + "/api/user/me");
      
      if (response.data.success) {
        setUser(response.data.user);
        console.log("Token validated successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token validation failed:", error);
      
      // If user endpoint fails, try cart endpoint as fallback validation
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.log("Trying alternative token validation...");
        try {
          const cartResponse = await axios.post(url + "/api/cart/get", {});
          // If we get here without error, token is valid
          setUser({ name: "User", email: "user@example.com" });
          return true;
        } catch (cartError) {
          console.error("Alternative token validation failed:", cartError);
          return false;
        }
      }
      
      return false;
    }
  };

  // Set token function
  const setTokenFunction = async (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      
      // Validate token and load user data
      const isValid = await validateToken(newToken);
      if (isValid) {
        await loadCartData();
        await fetchAuthenticatedFoodList(); // Refresh food list with valid token
      } else {
        clearInvalidToken();
      }
    } else {
      clearInvalidToken();
    }
  };

  // Initialize application
  const initializeApp = async () => {
    setLoading(true);
    
    try {
      // First, try to load food list without authentication
      await fetchFoodList();
      await fetchMenuList();
      
      // Then check for existing token
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        console.log("Found stored token, validating...");
        await setTokenFunction(storedToken);
      } else {
        console.log("No stored token found, continuing as guest");
      }
    } catch (error) {
      console.error("Error during app initialization:", error);
    } finally {
      setLoading(false);
    }
  };

  // On component mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Context value
  const contextValue = {
    url,
    food_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken: setTokenFunction,
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
    user,
    setUser,
    clearInvalidToken,
    fetchFoodList: fetchAuthenticatedFoodList,
    loading,
    initializeApp,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;