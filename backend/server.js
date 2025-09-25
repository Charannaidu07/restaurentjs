import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express();
const port = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Uploads directory created");
}

// middlewares
app.use(express.json());
app.use(cors());

// Route debugging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.originalUrl}`);
    next();
});

// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/images", express.static("uploads"));
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Debug route to check all available routes
app.get("/api/debug/routes", (req, res) => {
    res.json({
        success: true,
        message: "Available routes",
        orderRoutes: [
            "POST /api/order/razorpay-create-order",
            "POST /api/order/placecod",
            "POST /api/order/razorpay-verify-payment",
            "POST /api/order/verify",
            "POST /api/order/userorders",
            "GET /api/order/list",
            "GET /api/order/restaurant-orders",
            "POST /api/order/status"
        ]
    });
});

app.get("/", (req, res) => {
  res.send("API Working ✅");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running", 
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Route not found",
        method: req.method,
        url: req.originalUrl
    });
});

app.listen(port, () => {
    console.log(`🚀 Server started on http://localhost:${port}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
});