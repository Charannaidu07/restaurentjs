import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'

const Home = ({ searchQuery }) => {
    const [category, setCategory] = useState("All");
    // State to manage the selected restaurant for filtering
    const [restaurantFilter, setRestaurantFilter] = useState("All");

    return (
        <>
            <Header />
            {/* Pass setCategory to ExploreMenu to handle category selection */}
            <ExploreMenu setCategory={setCategory} category={category} />
            {/* Pass restaurantFilter and setRestaurantFilter to FoodDisplay */}
            <FoodDisplay 
                category={category} 
                restaurantFilter={restaurantFilter} 
                setRestaurantFilter={setRestaurantFilter}
                searchQuery={searchQuery} 
            />
        </>
    )
}

export default Home;