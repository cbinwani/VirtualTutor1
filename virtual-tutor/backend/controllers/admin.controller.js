// Admin controller for Virtual Tutor application
const { User, Course, Session } = require('../models');
const ragService = require('../services/rag.service');
const logger = require('../utils/logger');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not authorized to access this resource'
        }
      });
    }
    
    const { page = 1, limit = 10, search } = req.query;
    
    // Build query
    let query = {};
    if (search) {
      query = {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get users
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');
    
    // Get total count
    const totalUsers = await User.countDocuments(query);
    
    logger.info(`Admin retrieved ${users.length} users`);
    
    return res.status(200).json({
      users: users.map(user => ({
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        registrationDate: user.createdAt,
        lastActive: user.updatedAt,
        enrolledCourses: user.enrolledCourses.length
      })),
      totalUsers,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Error retrieving users:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve users'
      }
    });
  }
};

// Get all courses (admin only)
exports.getCourses = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not authorized to access this resource'
        }
      });
    }
    
    const { page = 1, limit = 10, category } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get courses
    const courses = await Course.find(query)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const totalCourses = await Course.countDocuments(query);
    
    logger.info(`Admin retrieved ${courses.length} courses`);
    
    return res.status(200).json({
      courses: courses.map(course => ({
        courseId: course._id,
        title: course.title,
        category: course.category,
        level: course.level,
        enrollmentCount: course.enrollmentCount,
        lastUpdated: course.updatedAt,
        status: 'active' // In a real app, you might have a status field
      })),
      totalCourses,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Error retrieving courses:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve courses'
      }
    });
  }
};

// Create a new course (admin only)
exports.createCourse = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not authorized to access this resource'
        }
      });
    }
    
    const { title, description, category, level, topics, prerequisites, objectives } = req.body;
    
    // Create course
    const course = new Course({
      title,
      description,
      category,
      level,
      topics: topics.map((topic, index) => ({
        ...topic,
        topicId: `topic-${index + 1}`,
        order: index + 1
      })),
      prerequisites: prerequisites || [],
      objectives: objectives || []
    });
    
    await course.save();
    
    logger.info(`Admin created new course: ${title}`);
    
    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      courseId: course._id
    });
  } catch (error) {
    logger.error('Error creating course:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create course'
      }
    });
  }
};

// Update a course (admin only)
exports.updateCourse = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not authorized to access this resource'
        }
      });
    }
    
    const { courseId } = req.params;
    const { title, description, category, level, topics, prerequisites, objectives } = req.body;
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }
    
    // Update course
    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.level = level || course.level;
    
    if (topics) {
      course.topics = topics.map((topic, index) => ({
        ...topic,
        topicId: topic.topicId || `topic-${index + 1}`,
        order: index + 1
      }));
    }
    
    if (prerequisites) course.prerequisites = prerequisites;
    if (objectives) course.objectives = objectives;
    
    course.updatedAt = new Date();
    
    await course.save();
    
    logger.info(`Admin updated course: ${courseId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Course updated successfully'
    });
  } catch (error) {
    logger.error('Error updating course:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update course'
      }
    });
  }
};

// Upload course material (admin only)
exports.uploadMaterial = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not authorized to access this resource'
        }
      });
    }
    
    const { courseId } = req.params;
    const { title, type, topicId, content } = req.body;
    
    // In a real application, you would handle file uploads
    // For this implementation, we'll assume the file is uploaded and we have a URL
    
    // Generate a placeholder URL
    const url = `/materials/${courseId}/${title.replace(/\s+/g, '-').toLowerCase()}.${type === 'document' ? 'pdf' : type}`;
    
    // Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }
    
    // Add material
    const material = {
      title,
      type,
      url,
      content, // For RAG indexing
      topicId
    };
    
    course.materials.push(material);
    await course.save();
    
    // Index material for RAG
    if (content) {
      await ragService.indexCourseMaterial(courseId, {
        materialId: course.materials[course.materials.length - 1]._id,
        title,
        content,
        type
      });
    }
    
    logger.info(`Admin uploaded material for course ${courseId}: ${title}`);
    
    return res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      materialId: course.materials[course.materials.length - 1]._id,
      url
    });
  } catch (error) {
    logger.error('Error uploading material:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload material'
      }
    });
  }
};

// Get analytics (admin only)
exports.getAnalytics = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Not authorized to access this resource'
        }
      });
    }
    
    const { startDate, endDate, courseId } = req.query;
    
    // Build date range
    const dateRange = {};
    if (startDate) dateRange.$gte = new Date(startDate);
    if (endDate) dateRange.$lte = new Date(endDate);
    
    // User metrics
    const totalUsers = await User.countDocuments();
    
    // Active users (users with sessions in date range)
    const activeUsersQuery = {};
    if (Object.keys(dateRange).length > 0) {
      activeUsersQuery.startTime = dateRange;
    }
    const activeSessions = await Session.find(activeUsersQuery);
    const activeUserIds = [...new Set(activeSessions.map(session => session.userId.toString()))];
    const activeUsers = activeUserIds.length;
    
    // New users in date range
    const newUsersQuery = {};
    if (Object.keys(dateRange).length > 0) {
      newUsersQuery.createdAt = dateRange;
    }
    const newUsers = await User.countDocuments(newUsersQuery);
    
    // Course metrics
    const courses = await Course.find().sort({ enrollmentCount: -1 }).limit(5);
    
    // Session metrics
    const sessionsQuery = {};
    if (courseId) sessionsQuery.courseId = courseId;
    if (Object.keys(dateRange).length > 0) {
      sessionsQuery.startTime = dateRange;
    }
    
    const sessions = await Session.find(sessionsQuery);
    const totalSessions = sessions.length;
    
    // Average session duration
    const totalDuration = sessions.reduce((total, session) => {
      return total + (session.duration || 0);
    }, 0);
    const averageSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    
    // Peak usage times
    const usageByHour = {};
    sessions.forEach(session => {
      const day = new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long' });
      const hour = new Date(session.startTime).getHours();
      const key = `${day}-${hour}`;
      
      if (!usageByHour[key]) {
        usageByHour[key] = {
          day,
          hour,
          sessionCount: 0
        };
      }
      
      usageByHour[key].sessionCount++;
    });
    
    const peakUsageTimes = Object.values(usageByHour)
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 5);
    
    // Performance metrics
    const users = await User.find();
    const completionRates = [];
    
    users.forEach(user => {
      user.performanceHistory.forEach(history => {
        if (history.totalQuestions > 0) {
          completionRates.push(history.score);
        }
      });
    });
    
    const averageCompletionRate = completionRates.length > 0
      ? Math.round(completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length)
      : 0;
    
    // Common improvement areas
    const improvementAreaCounts = {};
    users.forEach(user => {
      user.improvementAreas.forEach(item => {
        item.areas.forEach(area => {
          if (!improvementAreaCounts[area]) {
            improvementAreaCounts[area] = 0;
          }
          improvementAreaCounts[area]++;
        });
      });
    });
    
    const commonImprovementAreas = Object.entries(improvementAreaCounts)
      .map(([area, frequency]) => ({ area, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
    
    logger.info('Admin retrieved analytics');
    
    return res.status(200).json({
      userMetrics: {
        totalUsers,
        activeUsers,
        newUsers
      },
      courseMetrics: {
        totalEnrollments: courses.reduce((total, course) => total + course.enrollmentCount, 0),
        mostPopularCourses: courses.map(course => ({
          courseId: course._id,
          title: course.title,
          enrollments: course.enrollmentCount
        }))
      },
      sessionMetrics: {
        totalSessions,
        averageSessionDuration,
        peakUsageTimes
      },
      performanceMetrics: {
        averageCompletionRate,
        commonImprovementAreas
      }
    });
  } catch (error) {
    logger.error('Error retrieving analytics:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve analytics'
      }
    });
  }
};

module.exports = exports;
