// Routes for user functionality
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Set user preferences
router.post('/preferences', auth, userController.setPreferences);

// Get user learning history
router.get('/learning-history', auth, userController.getLearningHistory);

module.exports = router;
