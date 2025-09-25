// userRoute.js
import express from "express";
import { loginUser, registerUser, createRestaurantAdmin, getCurrentUser } from "../controllers/userController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/create-restaurant-admin", authenticateToken, requireAdmin, createRestaurantAdmin);
router.get("/me", authenticateToken, getCurrentUser);

export default router;