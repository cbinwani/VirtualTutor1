// User controller for Virtual Tutor application
const { User } = require('../models');
const logger = require('../utils/logger');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user without password
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    logger.info(`Retrieved profile for user ${userId}`);
    
    return res.status(200).json({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      preferences: user.preferences,
      enrolledCourses: user.enrolledCourses
    });
  } catch (error) {
    logger.error('Error retrieving user profile:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve user profile'
      }
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, preferences } = req.body;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          preferences: preferences,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    logger.info(`Updated profile for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user profile'
      }
    });
  }
};

// Set user preferences
exports.setPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseInterests, skillLevel, learningGoals, studySchedule } = req.body;
    
    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'preferences.courseInterests': courseInterests,
          'preferences.skillLevel': skillLevel,
          'preferences.learningGoals': learningGoals,
          'preferences.studySchedule': studySchedule,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    logger.info(`Set preferences for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Preferences saved successfully'
    });
  } catch (error) {
    logger.error('Error setting user preferences:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to save preferences'
      }
    });
  }
};

// Get user learning history
exports.getLearningHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, startDate, endDate } = req.query;
    
    // Build query
    const query = { userId };
    if (courseId) query.courseId = courseId;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    // Get sessions
    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .populate('courseId', 'title');
    
    // Calculate total duration
    const totalDuration = sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);
    
    logger.info(`Retrieved learning history for user ${userId}`);
    
    return res.status(200).json({
      sessions: sessions.map(session => ({
        sessionId: session._id,
        courseId: session.courseId._id,
        courseName: session.courseId.title,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        topicsCovered: session.topicsCovered,
        performanceMetrics: session.performanceMetrics
      })),
      totalSessions: sessions.length,
      totalDuration
    });
  } catch (error) {
    logger.error('Error retrieving learning history:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve learning history'
      }
    });
  }
};

module.exports = exports;
