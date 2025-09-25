// userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'restaurant_admin'], default: 'admin' },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }, // For restaurant admins
    cartData: { type: Object, default: {} }
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;