// Routes for avatar functionality
const express = require('express');
const router = express.Router();
const avatarController = require('../controllers/avatar.controller');
const auth = require('../middleware/auth');

// Get all available avatars
router.get('/', auth, avatarController.getAvatars);

// Get avatar details
router.get('/:avatarId', auth, avatarController.getAvatarDetails);

module.exports = router;
