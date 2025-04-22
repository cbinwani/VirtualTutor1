// Routes for course functionality
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const auth = require('../middleware/auth');

// Get all available courses
router.get('/', auth, courseController.getCourses);

// Get course details
router.get('/:courseId', auth, courseController.getCourseDetails);

// Enroll in a course
router.post('/:courseId/enroll', auth, courseController.enrollCourse);

// Get course progress
router.get('/:courseId/progress', auth, courseController.getCourseProgress);

module.exports = router;
