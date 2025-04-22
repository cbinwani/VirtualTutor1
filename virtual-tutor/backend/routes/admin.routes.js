// Routes for admin functionality
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/users', auth, adminController.getUsers);

// Get all courses (admin only)
router.get('/courses', auth, adminController.getCourses);

// Create a new course (admin only)
router.post('/courses', auth, adminController.createCourse);

// Update a course (admin only)
router.put('/courses/:courseId', auth, adminController.updateCourse);

// Upload course material (admin only)
router.post('/courses/:courseId/materials', auth, adminController.uploadMaterial);

// Get analytics (admin only)
router.get('/analytics', auth, adminController.getAnalytics);

module.exports = router;
