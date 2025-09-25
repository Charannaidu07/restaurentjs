// routes/cartRoute.js
import express from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const cartRouter = express.Router();

cartRouter.post("/get", authenticateToken, getCart);
cartRouter.post("/add", authenticateToken, addToCart);
cartRouter.post("/remove", authenticateToken, removeFromCart);

export default cartRouter;