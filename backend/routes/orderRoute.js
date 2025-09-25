// routes/orderRoute.js
import express from 'express';
import { 
    userOrders, 
    listOrders, 
    placeOrderCod, 
    verifyOrder, 
    createRazorpayOrder, 
    verifyRazorpayPayment,
    updateStatus,
    getRestaurantOrders
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Now this will work

const router = express.Router();

// Apply auth middleware to protected routes
router.post('/userorders', authMiddleware, userOrders);
router.post('/placecod', authMiddleware, placeOrderCod);
router.post('/razorpay-create-order', authMiddleware, createRazorpayOrder);
router.post('/razorpay-verify-payment', authMiddleware, verifyRazorpayPayment);
router.post('/verify', authMiddleware, verifyOrder);
router.post('/status', authMiddleware, updateStatus);

// Admin routes
router.get('/list', listOrders);
router.get('/restaurant-orders', getRestaurantOrders);

export default router;