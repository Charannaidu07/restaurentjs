// routes/restaurantRoute.js
import express from "express";
import { addRestaurant, listRestaurants, removeRestaurant } from "../controllers/restaurantController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";

const restaurantRouter = express.Router();

// Image storage for restaurants
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `rest_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// API Endpoints
restaurantRouter.post("/add", authenticateToken, requireAdmin, upload.single("image"), addRestaurant);
restaurantRouter.get("/list", authenticateToken, listRestaurants);
restaurantRouter.post("/remove", authenticateToken, requireAdmin, removeRestaurant);

export default restaurantRouter;