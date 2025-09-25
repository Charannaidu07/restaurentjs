// restaurantModel.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  adminEmail: { type: String }, // Email of restaurant admin
}, { timestamps: true });

const restaurantModel = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
export default restaurantModel;