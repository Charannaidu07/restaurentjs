import restaurantModel from "../models/restaurantModel.js";
import fs from 'fs';

// Add restaurant
const addRestaurant = async (req, res) => {
  try {
    const { name, description, address } = req.body;
    const image_filename = `${req.file.filename}`;

    const restaurant = new restaurantModel({
      name,
      description,
      address,
      image: image_filename,
    });

    await restaurant.save();
    res.json({ success: true, message: "Restaurant Added" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding restaurant" });
  }
};

// List all restaurants
const listRestaurants = async (req, res) => {
  try {
    const restaurants = await restaurantModel.find({});
    res.json({ success: true, data: restaurants });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error listing restaurants" });
  }
};

// Remove restaurant
const removeRestaurant = async (req, res) => {
  try {
    const restaurant = await restaurantModel.findById(req.body.id);
    if (!restaurant) {
      return res.json({ success: false, message: "Restaurant not found" });
    }
    fs.unlink(`uploads/${restaurant.image}`, (err) => {
      if (err) console.error("Error deleting image file:", err);
    });

    await restaurantModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Restaurant Removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error removing restaurant" });
  }
};

export { addRestaurant, listRestaurants, removeRestaurant };