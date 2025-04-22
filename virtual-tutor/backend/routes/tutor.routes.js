// Routes for Virtual Tutor application
const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutor.controller');
const auth = require('../middleware/auth');

// Start a new tutoring session
router.post('/session/start', auth, tutorController.startSession);

// Send a message in a tutoring session
router.post('/session/:sessionId/message', auth, tutorController.sendMessage);

// End a tutoring session
router.post('/session/:sessionId/end', auth, tutorController.endSession);

// Get session history
router.get('/session/:sessionId/history', auth, tutorController.getSessionHistory);

// Generate practice exercises
router.post('/exercises/:courseId/:topicId', auth, tutorController.generateExercises);

// Assess exercise responses
router.post('/assess/:courseId', auth, tutorController.assessExercises);

module.exports = router;
