// routes/foodRoute.js
import express from "express";
import { addFood, listFood, removeFood, listMenu } from "../controllers/foodController.js";
import { authenticateToken, requireRestaurantAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";

const foodRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Protected routes (require authentication)
foodRouter.post("/add", authenticateToken, requireRestaurantAdmin, upload.single("image"), addFood);
foodRouter.post("/remove", authenticateToken, requireRestaurantAdmin, removeFood);

// Public routes (no authentication required) - REMOVE authenticateToken
foodRouter.get("/list", listFood); // Remove authenticateToken from here
foodRouter.get("/menulist", listMenu);

export default foodRouter;