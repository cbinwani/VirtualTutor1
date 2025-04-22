// Course controller for Virtual Tutor application
const { Course, User } = require('../models');
const ragService = require('../services/rag.service');
const logger = require('../utils/logger');

// Get all available courses
exports.getCourses = async (req, res) => {
  try {
    const { category, level, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (level) query.level = level;
    
    // Pagination
    const skip = (page - 1) * limit;
    
    // Get courses
    const courses = await Course.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .select('courseId title description category level duration topics enrollmentCount');
    
    // Get total count
    const totalCourses = await Course.countDocuments(query);
    
    logger.info(`Retrieved ${courses.length} courses`);
    
    return res.status(200).json({
      courses: courses.map(course => ({
        courseId: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        topics: course.topics.map(topic => topic.title),
        enrollmentCount: course.enrollmentCount
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

// Get course details
exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Get course
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
    
    logger.info(`Retrieved details for course ${courseId}`);
    
    return res.status(200).json({
      courseId: course._id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      topics: course.topics.map(topic => ({
        topicId: topic.topicId,
        title: topic.title,
        description: topic.description,
        estimatedDuration: topic.estimatedDuration
      })),
      prerequisites: course.prerequisites,
      objectives: course.objectives,
      materials: course.materials.map(material => ({
        materialId: material._id,
        title: material.title,
        type: material.type,
        url: material.url
      }))
    });
  } catch (error) {
    logger.error('Error retrieving course details:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve course details'
      }
    });
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if course exists
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
    
    // Check if already enrolled
    const user = await User.findById(userId);
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_ENROLLED',
          message: 'Already enrolled in this course'
        }
      });
    }
    
    // Enroll user
    user.enrolledCourses.push(courseId);
    await user.save();
    
    // Update enrollment count
    course.enrollmentCount += 1;
    await course.save();
    
    logger.info(`User ${userId} enrolled in course ${courseId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollmentId: `${userId}-${courseId}`
    });
  } catch (error) {
    logger.error('Error enrolling in course:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to enroll in course'
      }
    });
  }
};

// Get course progress
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    
    // Check if course exists
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
    
    // Check if enrolled
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_ENROLLED',
          message: 'Not enrolled in this course'
        }
      });
    }
    
    // Get sessions for this course
    const sessions = await Session.find({ userId, courseId });
    
    // Calculate completed topics
    const completedTopics = [...new Set(sessions.flatMap(session => session.topicsCovered))];
    
    // Calculate progress percentage
    const progress = Math.round((completedTopics.length / course.topics.length) * 100);
    
    // Get assessment scores
    const assessmentScores = user.performanceHistory
      .filter(item => item.courseId.toString() === courseId)
      .map(item => ({
        assessmentId: item._id,
        score: item.score,
        date: item.date
      }));
    
    // Get improvement areas
    const improvementAreas = user.improvementAreas
      .find(item => item.courseId.toString() === courseId)?.areas || [];
    
    // Determine current and next topics
    let currentTopic = null;
    let nextTopic = null;
    
    if (completedTopics.length < course.topics.length) {
      // Find first incomplete topic
      const sortedTopics = [...course.topics].sort((a, b) => a.order - b.order);
      for (const topic of sortedTopics) {
        if (!completedTopics.includes(topic.topicId)) {
          currentTopic = topic.topicId;
          break;
        }
      }
      
      // Find next topic
      const currentTopicIndex = sortedTopics.findIndex(t => t.topicId === currentTopic);
      if (currentTopicIndex < sortedTopics.length - 1) {
        nextTopic = sortedTopics[currentTopicIndex + 1].topicId;
      }
    }
    
    logger.info(`Retrieved progress for user ${userId} in course ${courseId}`);
    
    return res.status(200).json({
      courseId,
      progress,
      completedTopics,
      currentTopic,
      nextTopic,
      assessmentScores,
      improvementAreas
    });
  } catch (error) {
    logger.error('Error retrieving course progress:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve course progress'
      }
    });
  }
};

module.exports = exports;
