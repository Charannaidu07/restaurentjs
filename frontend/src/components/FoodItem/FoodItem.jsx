import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../Context/StoreContext";

const FoodItem = ({ _id, image, name, price, desc, restaurantName }) => {
  const { cartItems, addToCart, removeFromCart, url, currency } = useContext(StoreContext);

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={url + "/images/" + image} alt={name} />

        {!cartItems?.[_id] ? (
          <img
            className="add"
            onClick={() => addToCart(_id)}
            src={assets.add_icon_white}
            alt="Add"
          />
        ) : (
          <div className="food-item-counter">
            <img
              src={assets.remove_icon_red}
              onClick={() => removeFromCart(_id)}
              alt="Remove"
            />
            <p>{cartItems[_id]}</p>
            <img
              src={assets.add_icon_green}
              onClick={() => addToCart(_id)}
              alt="Add"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="rating" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-restaurant">{restaurantName}</p>
        <p className="food-item-price">
          {currency}
          {price}
        </p>
      </div>
    </div>
  );
};

export default FoodItem;
