import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (event) => {
        const newQuery = event.target.value;
        setQuery(newQuery);
        // This is where you pass the query to a parent component for filtering
        onSearch(newQuery); 
    };

    return (
        <input
            type="text"
            placeholder="Search for restaurants and dishes..."
            value={query}
            onChange={handleInputChange}
            className="search-input"
        />
    );
};

export default SearchBar;