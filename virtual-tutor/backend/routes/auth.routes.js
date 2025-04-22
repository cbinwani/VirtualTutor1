// Routes for authentication
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Verify email
router.post('/verify-email', authController.verifyEmail);

// Verify phone
router.post('/verify-phone', authController.verifyPhone);

// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
