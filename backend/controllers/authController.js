import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import UserSupabase from '../models/UserSupabase.js';

dotenv.config();

const User = UserSupabase;

// Update the token generation function to handle missing secret
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register a new user
export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide name, email and password' 
      });
    }

    // Check if user already exists
    const userExists = await User.findByEmail(email);
      
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        error: 'Email already registered' 
      });
    }
    
    // Create new user
    const user = await User.create({ name, email, password });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error during signup process' 
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials. Please check your email." 
      });
    }
    
    // Check password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials. Please check your password." 
      });
    }
    
    // Generate token for successful login
    const token = generateToken(user.id);
    
    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login process' 
    });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error fetching user profile' 
    });
  }
};
