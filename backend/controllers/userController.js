// controllers/userController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}

// Register user (for general users)
const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    try{
        //check if user already exists
        const exists = await userModel.findOne({email})
        if(exists){
            return res.json({success:false,message: "User already exists"})
        }

        // validating email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"})
        }
        if(password.length<8){
            return res.json({success:false,message: "Please enter a strong password"})
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({name, email, password: hashedPassword})
        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({
            success:true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })

    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// Create restaurant admin user
const createRestaurantAdmin = async (req, res) => {
    const { name, email, password, restaurantId } = req.body;
    
    try {
        // Check if user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message: "User already exists"});
        }

        // Validate email format & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message: "Please enter a valid email"});
        }
        if(password.length < 8){
            return res.json({success:false,message: "Password must be at least 8 characters"});
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name, 
            email, 
            password: hashedPassword,
            role: 'restaurant_admin',
            restaurantId
        });
        
        const user = await newUser.save();
        res.json({success:true, message: "Restaurant admin created successfully", data: user});
    } catch(error){
        console.log(error);
        res.json({success:false,message:"Error creating restaurant admin"});
    }
}

// Login user (updated for role-based access)
const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email}).populate('restaurantId');

        if(!user){
            return res.json({success:false,message: "User does not exist"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success:false,message: "Invalid credentials"});
        }

        const token = createToken(user._id);
        res.json({
            success:true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId
            }
        });
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"});
    }
}

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).populate('restaurantId');
        if (!user) {
            return res.json({success:false,message: "User not found"});
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                restaurantId: user.restaurantId
            }
        });
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error fetching user data"});
    }
}

export { loginUser, registerUser, createRestaurantAdmin, getCurrentUser };