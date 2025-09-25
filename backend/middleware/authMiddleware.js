// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const authenticateToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = verified.id;
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid token" });
    }
};

export const requireAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const requireRestaurantAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.userId);
        if (!user || (user.role !== 'restaurant_admin' && user.role !== 'admin')) {
            return res.status(403).json({ success: false, message: "Restaurant admin access required" });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Also export as default for compatibility with orderRoute.js
export default authenticateToken;