import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: String,
  rating: { type: Number, default: 0 },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
}, { timestamps: true });

const foodModel = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default foodModel;
