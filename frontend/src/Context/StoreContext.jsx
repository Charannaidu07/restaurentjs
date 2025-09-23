import { createContext, useEffect, useState } from "react";
import axios from "axios";

// Create Context
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const url = "http://localhost:4000"; // backend URL

  const [food_list, setFoodList] = useState([]);   // Food items
  const [cartItems, setCartItems] = useState({});  // Cart state
  const [token, setToken] = useState("");          // User token

  const currency = "₹";
  const deliveryCharge = 50;

  // ---------------------------
  // Cart functions
  // ---------------------------
  const addToCart = async (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));

    if (token) {
      try {
        await axios.post(
          url + "/api/cart/add",
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error adding to cart:", err);
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
        await axios.post(
          url + "/api/cart/remove",
          { itemId },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error removing from cart:", err);
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

  // ---------------------------
  // Fetch food items
  // ---------------------------
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      if (response.data && response.data.data) {
        setFoodList(response.data.data);
        console.log("Fetched food list:", response.data.data);
      }
    } catch (err) {
      console.error("Error fetching food list:", err);
    }
  };

  // ---------------------------
  // Load cart data
  // ---------------------------
  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData || {});
    } catch (err) {
      console.error("Error loading cart data:", err);
    }
  };

  // ---------------------------
  // On Mount
  // ---------------------------
  useEffect(() => {
    const init = async () => {
      await fetchFoodList();
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        await loadCartData(storedToken);
      }
    };
    init();
  }, []);

  // ---------------------------
  // Context value
  // ---------------------------
  const contextValue = {
    url,
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    token,
    setToken,
    loadCartData,
    setCartItems,
    currency,
    deliveryCharge,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
