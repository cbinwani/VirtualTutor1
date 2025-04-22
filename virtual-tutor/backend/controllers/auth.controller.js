// Authentication controller for Virtual Tutor application
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new User({
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    logger.info(`Registered new user: ${email}`);
    
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: user._id,
      token
    });
  } catch (error) {
    logger.error('Error registering user:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to register user'
      }
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid credentials'
        }
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Invalid credentials'
        }
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    logger.info(`User logged in: ${email}`);
    
    return res.status(200).json({
      success: true,
      userId: user._id,
      token,
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN) || 604800 // Default to 7 days in seconds
    });
  } catch (error) {
    logger.error('Error logging in user:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to login'
      }
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // In a real application, you would validate the verification code
    // For this implementation, we'll just mark the email as verified
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    user.isVerified.email = true;
    await user.save();
    
    logger.info(`Email verified for user: ${email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Error verifying email:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify email'
      }
    });
  }
};

// Verify phone
exports.verifyPhone = async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    // In a real application, you would validate the verification code
    // For this implementation, we'll just mark the phone as verified
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    user.isVerified.phone = true;
    await user.save();
    
    logger.info(`Phone verified for user: ${phone}`);
    
    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully'
    });
  } catch (error) {
    logger.error('Error verifying phone:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to verify phone'
      }
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    // In a real application, you would generate a reset token and send an email
    // For this implementation, we'll just return a success message
    
    logger.info(`Password reset requested for user: ${email}`);
    
    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    logger.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reset password'
      }
    });
  }
};

module.exports = exports;
