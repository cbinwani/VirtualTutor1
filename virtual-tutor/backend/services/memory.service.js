// Memory service for Virtual Tutor application
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class MemoryService {
  constructor() {
    // Initialize models if needed
    this.sessionModel = mongoose.model('Session');
    this.messageModel = mongoose.model('Message');
    this.userModel = mongoose.model('User');
    logger.info('Memory service initialized');
  }

  // Short-term memory: Store and retrieve current session data
  async saveSessionState(sessionId, state) {
    try {
      await this.sessionModel.findByIdAndUpdate(
        sessionId,
        { 
          $set: { 
            currentState: state,
            lastUpdated: new Date()
          } 
        },
        { new: true, upsert: false }
      );
      
      logger.info(`Saved state for session ${sessionId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error saving session state:', error);
      throw new Error('Failed to save session state');
    }
  }

  async getSessionState(sessionId) {
    try {
      const session = await this.sessionModel.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      logger.info(`Retrieved state for session ${sessionId}`);
      return session.currentState;
    } catch (error) {
      logger.error('Error retrieving session state:', error);
      throw new Error('Failed to retrieve session state');
    }
  }

  // Long-term memory: Store and retrieve conversation history across sessions
  async getConversationHistory(userId, courseId, limit = 50) {
    try {
      // Find recent sessions for this user and course
      const sessions = await this.sessionModel.find({
        userId,
        courseId
      })
      .sort({ endTime: -1 })
      .limit(10);
      
      if (sessions.length === 0) {
        return [];
      }
      
      // Get session IDs
      const sessionIds = sessions.map(session => session._id);
      
      // Retrieve messages from these sessions
      const messages = await this.messageModel.find({
        sessionId: { $in: sessionIds }
      })
      .sort({ timestamp: -1 })
      .limit(limit);
      
      // Format messages for conversation history
      const formattedHistory = messages.reverse().map(msg => {
        return `${msg.sender === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`;
      }).join('\n\n');
      
      logger.info(`Retrieved conversation history for user ${userId} in course ${courseId}`);
      return formattedHistory;
    } catch (error) {
      logger.error('Error retrieving conversation history:', error);
      throw new Error('Failed to retrieve conversation history');
    }
  }

  // Track student performance and improvement areas
  async updatePerformanceMetrics(userId, courseId, metrics) {
    try {
      const { correctAnswers, totalQuestions, improvementAreas } = metrics;
      
      // Update user's performance record for this course
      await this.userModel.findByIdAndUpdate(
        userId,
        {
          $push: {
            'performanceHistory': {
              courseId,
              date: new Date(),
              correctAnswers,
              totalQuestions,
              score: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
            }
          }
        }
      );
      
      // Update improvement areas if provided
      if (improvementAreas && improvementAreas.length > 0) {
        // Find existing improvement areas for this course
        const user = await this.userModel.findById(userId);
        const courseImprovementAreas = user.improvementAreas.find(
          item => item.courseId.toString() === courseId.toString()
        );
        
        if (courseImprovementAreas) {
          // Update existing improvement areas
          await this.userModel.findOneAndUpdate(
            { 
              _id: userId, 
              'improvementAreas.courseId': courseId 
            },
            {
              $set: {
                'improvementAreas.$.areas': improvementAreas,
                'improvementAreas.$.lastUpdated': new Date()
              }
            }
          );
        } else {
          // Add new improvement areas for this course
          await this.userModel.findByIdAndUpdate(
            userId,
            {
              $push: {
                'improvementAreas': {
                  courseId,
                  areas: improvementAreas,
                  lastUpdated: new Date()
                }
              }
            }
          );
        }
      }
      
      logger.info(`Updated performance metrics for user ${userId} in course ${courseId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error updating performance metrics:', error);
      throw new Error('Failed to update performance metrics');
    }
  }

  // Get student's improvement areas for a course
  async getImprovementAreas(userId, courseId) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const courseImprovementAreas = user.improvementAreas.find(
        item => item.courseId.toString() === courseId.toString()
      );
      
      if (!courseImprovementAreas) {
        return [];
      }
      
      logger.info(`Retrieved improvement areas for user ${userId} in course ${courseId}`);
      return courseImprovementAreas.areas;
    } catch (error) {
      logger.error('Error retrieving improvement areas:', error);
      throw new Error('Failed to retrieve improvement areas');
    }
  }

  // Get student's performance history for a course
  async getPerformanceHistory(userId, courseId) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const coursePerformance = user.performanceHistory.filter(
        item => item.courseId.toString() === courseId.toString()
      );
      
      logger.info(`Retrieved performance history for user ${userId} in course ${courseId}`);
      return coursePerformance;
    } catch (error) {
      logger.error('Error retrieving performance history:', error);
      throw new Error('Failed to retrieve performance history');
    }
  }

  // Resume learning from where student left off
  async getResumePoint(userId, courseId) {
    try {
      // Find the most recent session for this user and course
      const lastSession = await this.sessionModel.findOne({
        userId,
        courseId
      })
      .sort({ endTime: -1 })
      .limit(1);
      
      if (!lastSession) {
        return null;
      }
      
      // Get the topic and progress information
      const resumePoint = {
        topicId: lastSession.topicId,
        lastActivity: lastSession.endTime,
        completedExercises: lastSession.completedExercises || [],
        nextExerciseId: lastSession.nextExerciseId,
        progress: lastSession.progress
      };
      
      logger.info(`Retrieved resume point for user ${userId} in course ${courseId}`);
      return resumePoint;
    } catch (error) {
      logger.error('Error retrieving resume point:', error);
      throw new Error('Failed to retrieve resume point');
    }
  }
}

module.exports = new MemoryService();
