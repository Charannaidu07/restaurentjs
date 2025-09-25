// controllers/foodController.js
import foodModel from "../models/foodModel.js";
import fs from "fs";

// ---------------- Add food ----------------
const addFood = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Image file is required" });

    const image_filename = req.file.filename;

    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename,
      restaurantId: req.body.restaurantId,
      rating: req.body.rating || 0,
    });

    await food.save();
    res.json({ success: true, message: "Food Added", data: food });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};

// ---------------- List all foods ----------------
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({}).populate("restaurantId", "name description address");
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ success: false, message: "Error fetching foods" });
  }
};

// ---------------- List menu categories ----------------
const listMenu = async (req, res) => {
  try {
    const categories = await foodModel.distinct("category");
    const menu = categories.map((category) => ({
      menu_name: category,
      menu_image: `/images/menu/${category.toLowerCase().replace(/\s/g, "_")}.png`,
    }));
    res.json({ success: true, data: menu });
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ success: false, message: "Error fetching menu list" });
  }
};

// ---------------- Remove food ----------------
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) return res.status(404).json({ success: false, message: "Food not found" });

    // delete image file
    fs.unlink(`uploads/${food.image}`, (err) => {
      if (err) console.warn("File delete error:", err);
    });

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.error("Error removing food:", error);
    res.status(500).json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood, listMenu };