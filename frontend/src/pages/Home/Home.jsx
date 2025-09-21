import React, { useState } from 'react'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = ({ searchQuery }) => {
    const [category, setCategory] = useState("All");
    const [restaurants, setRestaurants] = useState([]);

    return (
        <>
            <Header />
            <ExploreMenu setCategory={setCategory} category={category} restaurants={restaurants} setRestaurants={setRestaurants} />
            <FoodDisplay category={category} searchQuery={searchQuery} restaurants={restaurants} />
            <AppDownload />
        </>
    )
}

export default Home;