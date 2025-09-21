import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { listOrders, updateStatus, userOrders, verifyOrder, placeOrderCod, createRazorpayOrder, verifyRazorpayPayment } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.get("/list", listOrders);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);

// Razorpay endpoints
orderRouter.post("/razorpay-create-order", authMiddleware, createRazorpayOrder);
orderRouter.post("/razorpay-verify-payment", authMiddleware, verifyRazorpayPayment);

export default orderRouter;