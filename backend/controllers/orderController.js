import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Razorpay from "razorpay";
import crypto from 'crypto';

//config variables
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = 'http://localhost:5173';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Endpoint to create a Razorpay order
const createRazorpayOrder = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // Razorpay takes amount in paisa
            currency: "INR",
            receipt: `order_receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Save the order to your database with a pending status
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false, // Initially set to false
            razorpayOrderId: order.id, // Save the Razorpay order ID
        });
        await newOrder.save();
        
        res.json({ success: true, order });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Failed to create Razorpay order" });
    }
};

// Endpoint to verify the payment and update order status
const verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is successful, update the order in the database
            await orderModel.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { payment: true, status: "Food Processing" }
            );
            await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
            res.json({ success: true, message: "Payment Verified" });
        } else {
            // Payment verification failed, delete the order
            await orderModel.findOneAndDelete({ razorpayOrderId: razorpay_order_id });
            res.json({ success: false, message: "Payment Verification Failed" });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error during payment verification" });
    }
};


// Placing User Order for Frontend using stripe
const placeOrderCod = async (req, res) => {
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: true,
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({ success: true, message: "Order Placed" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing Order for Admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// User Orders for Frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const updateStatus = async (req, res) => {
    console.log(req.body);
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        res.json({ success: false, message: "Error" })
    }

}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId)
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        res.json({ success: false, message: "Not  Verified" })
    }

}

export { listOrders, userOrders, updateStatus, verifyOrder, placeOrderCod, createRazorpayOrder, verifyRazorpayPayment }