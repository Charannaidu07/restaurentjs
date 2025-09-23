import React, { useContext } from 'react';
import './FoodDisplay.css';
import FoodItem from '../FoodItem/FoodItem';
import { StoreContext } from '../../Context/StoreContext';

const FoodDisplay = ({ category, searchQuery, restaurants = [] }) => {
  const { food_list } = useContext(StoreContext);

  // Prevent errors if food_list is not loaded yet
  if (!food_list || food_list.length === 0) {
    return <p>Loading food items...</p>;
  }

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {food_list.map((item) => {
          // Check if the item matches the selected restaurant ID or "All"
          const matchesRestaurant =
            category === 'All' || category === item.restaurantId;

          // Check if the search query matches name, description, or category
          const matchesSearch =
            item.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
            item.description
              ?.toLowerCase()
              .includes(searchQuery?.toLowerCase() || '') ||
            item.category?.toLowerCase().includes(searchQuery?.toLowerCase() || '');

          if (matchesRestaurant && matchesSearch) {
            const restaurant = restaurants.find(
              (res) => res._id === item.restaurantId
            );
            const restaurantName = restaurant ? restaurant.name : 'Unknown Restaurant';

            return (
              <FoodItem
                key={item._id}
                image={item.image}
                name={item.name}
                desc={item.description}
                price={item.price}
                id={item._id}
                restaurantName={restaurantName}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;
