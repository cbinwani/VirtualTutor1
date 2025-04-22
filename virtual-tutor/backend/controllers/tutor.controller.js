// Tutor controller for Virtual Tutor application
const { Session, Message, User, Course } = require('../models');
const llmService = require('../services/llm.service');
const ragService = require('../services/rag.service');
const memoryService = require('../services/memory.service');
const logger = require('../utils/logger');

// Start a new tutoring session
exports.startSession = async (req, res) => {
  try {
    const { courseId, topicId, avatarId, llmConfig } = req.body;
    const userId = req.user.id;

    // Verify course enrollment
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in this course'
        }
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    // Create new session
    const session = new Session({
      userId,
      courseId,
      topicId,
      avatarId,
      llmConfig: llmConfig || {
        model: process.env.DEFAULT_LLM_MODEL,
        temperature: 0.7
      },
      startTime: new Date()
    });

    await session.save();

    // Get resume point if available
    const resumePoint = await memoryService.getResumePoint(userId, courseId);

    // Generate welcome message based on whether this is a new session or resuming
    let welcomePrompt;
    if (resumePoint && resumePoint.topicId === topicId) {
      welcomePrompt = `You are a virtual tutor for the course "${course.title}". The student is returning to continue their learning on the topic "${course.topics.find(t => t.topicId === topicId)?.title || 'current topic'}". They last studied this ${new Date(resumePoint.lastActivity).toLocaleDateString()}. Welcome them back warmly and briefly remind them what they were working on. Be encouraging and supportive.`;
    } else {
      welcomePrompt = `You are a virtual tutor for the course "${course.title}". The student is starting to learn about "${course.topics.find(t => t.topicId === topicId)?.title || 'a new topic'}". Welcome them warmly and give a brief introduction to this topic. Be encouraging and supportive.`;
    }

    // Configure LLM if custom settings provided
    if (llmConfig) {
      if (llmConfig.model) llmService.setModel(llmConfig.model);
      if (llmConfig.temperature) llmService.setTemperature(llmConfig.temperature);
    }

    // Generate welcome message
    const welcomeMessage = await llmService.llm.predict(welcomePrompt);

    // Save welcome message
    const message = new Message({
      sessionId: session._id,
      sender: 'tutor',
      content: welcomeMessage,
      timestamp: new Date()
    });

    await message.save();

    // Update session with message
    session.messages.push(message._id);
    await session.save();

    // Get avatar details
    const avatar = await Avatar.findById(avatarId);

    logger.info(`Started new session ${session._id} for user ${userId} in course ${courseId}`);
    
    return res.status(200).json({
      sessionId: session._id,
      avatarDetails: {
        avatarId: avatar._id,
        name: avatar.name,
        imageUrl: avatar.previewImageUrl
      },
      welcomeMessage: welcomeMessage,
      resumePoint: resumePoint
    });
  } catch (error) {
    logger.error('Error starting session:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start session'
      }
    });
  }
};

// Send a message in a tutoring session
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message: messageContent, messageType } = req.body;
    const userId = req.user.id;

    // Verify session exists and belongs to user
    const session = await Session.findById(sessionId).populate('messages');
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }

    if (session.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to access this session'
        }
      });
    }

    // Save user message
    const userMessage = new Message({
      sessionId,
      sender: 'user',
      content: messageContent,
      timestamp: new Date()
    });

    await userMessage.save();
    session.messages.push(userMessage._id);
    await session.save();

    // Get user info for personalization
    const user = await User.findById(userId);
    
    // Get course info
    const course = await Course.findById(session.courseId);

    // Get conversation history
    const recentMessages = session.messages.slice(-10).map(msg => {
      return `${msg.sender === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`;
    }).join('\n\n');

    // Get improvement areas
    const improvementAreas = await memoryService.getImprovementAreas(userId, session.courseId);

    // Prepare student info for RAG
    const studentInfo = {
      skillLevel: user.preferences.skillLevel,
      learningGoals: user.preferences.learningGoals,
      improvementAreas: improvementAreas
    };

    // Generate RAG-enhanced response
    const { response, sourceMaterials } = await ragService.generateResponse(
      llmService,
      session.courseId,
      messageContent,
      recentMessages,
      studentInfo
    );

    // Save tutor response
    const tutorMessage = new Message({
      sessionId,
      sender: 'tutor',
      content: response,
      timestamp: new Date(),
      sourceMaterials
    });

    await tutorMessage.save();
    session.messages.push(tutorMessage._id);
    
    // Update session state
    session.topicsCovered = [...new Set([...session.topicsCovered, session.topicId])];
    await session.save();

    // Generate suggested follow-up questions
    const followUpPrompt = `Based on the student's question: "${messageContent}" and your response, suggest 3 follow-up questions the student might want to ask to deepen their understanding. Format as a JSON array of strings.`;
    const suggestedFollowUps = JSON.parse(await llmService.llm.predict(followUpPrompt));

    logger.info(`Processed message in session ${sessionId}`);
    
    return res.status(200).json({
      messageId: tutorMessage._id,
      response: tutorMessage.content,
      responseType: 'text',
      sourceMaterials: tutorMessage.sourceMaterials,
      suggestedFollowUps
    });
  } catch (error) {
    logger.error('Error processing message:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process message'
      }
    });
  }
};

// End a tutoring session
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify session exists and belongs to user
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }

    if (session.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to access this session'
        }
      });
    }

    // Calculate session duration
    const endTime = new Date();
    const duration = Math.round((endTime - session.startTime) / 1000); // Duration in seconds

    // Update session
    session.endTime = endTime;
    session.duration = duration;
    await session.save();

    // Generate session summary
    const messages = await Message.find({ sessionId });
    const conversationText = messages.map(msg => {
      return `${msg.sender === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`;
    }).join('\n\n');

    const summaryPrompt = `
      You are analyzing a tutoring session to provide a summary and recommendations.
      
      Course: ${(await Course.findById(session.courseId)).title}
      Topic: ${session.topicId}
      Duration: ${Math.round(duration / 60)} minutes
      
      Conversation:
      ${conversationText}
      
      Please provide:
      1. A brief summary of what was covered in this session
      2. Recommendations for what the student should focus on next
      3. Identify any areas where the student might need additional practice or clarification
      
      Format your response as a JSON object with "summary", "nextSteps", and "improvementAreas" (array) properties.
    `;

    const summaryResponse = await llmService.llm.predict(summaryPrompt);
    const summary = JSON.parse(summaryResponse);

    // Update performance metrics with improvement areas
    if (summary.improvementAreas && summary.improvementAreas.length > 0) {
      await memoryService.updatePerformanceMetrics(userId, session.courseId, {
        improvementAreas: summary.improvementAreas
      });
    }

    logger.info(`Ended session ${sessionId}`);
    
    return res.status(200).json({
      sessionId,
      duration,
      topicsCovered: session.topicsCovered,
      summary: summary.summary,
      nextSteps: summary.nextSteps,
      improvementAreas: summary.improvementAreas
    });
  } catch (error) {
    logger.error('Error ending session:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to end session'
      }
    });
  }
};

// Get session history
exports.getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Verify session exists and belongs to user
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        }
      });
    }

    if (session.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized to access this session'
        }
      });
    }

    // Get messages
    const messages = await Message.find({ sessionId }).sort({ timestamp: 1 });

    logger.info(`Retrieved history for session ${sessionId}`);
    
    return res.status(200).json({
      sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      messages: messages.map(msg => ({
        messageId: msg._id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp,
        sourceMaterials: msg.sourceMaterials
      }))
    });
  } catch (error) {
    logger.error('Error retrieving session history:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve session history'
      }
    });
  }
};

// Generate practice exercises
exports.generateExercises = async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const { numExercises } = req.body;
    const userId = req.user.id;

    // Verify course enrollment
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in this course'
        }
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    // Get topic
    const topic = course.topics.find(t => t.topicId === topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOPIC_NOT_FOUND',
          message: 'Topic not found'
        }
      });
    }

    // Get improvement areas
    const improvementAreas = await memoryService.getImprovementAreas(userId, courseId);
    const improvementAreasText = improvementAreas.length > 0 
      ? improvementAreas.join(', ') 
      : 'General practice';

    // Generate exercises
    const exercises = await llmService.generatePracticeExercises(
      course.category,
      topic.title,
      user.preferences.skillLevel,
      improvementAreasText,
      numExercises || 3
    );

    logger.info(`Generated exercises for user ${userId} in course ${courseId}, topic ${topicId}`);
    
    return res.status(200).json({
      exercises,
      topic: topic.title,
      improvementAreas
    });
  } catch (error) {
    logger.error('Error generating exercises:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate exercises'
      }
    });
  }
};

// Assess exercise responses
exports.assessExercises = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { responses, correctAnswers } = req.body;
    const userId = req.user.id;

    // Verify course enrollment
    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in this course'
        }
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COURSE_NOT_FOUND',
          message: 'Course not found'
        }
      });
    }

    // Generate assessment
    const assessment = await llmService.assessPerformance(
      course.category,
      JSON.stringify(responses),
      JSON.stringify(correctAnswers)
    );

    // Identify improvement areas
    const improvementAreas = await llmService.identifyImprovementAreas(
      course.category,
      JSON.stringify(responses),
      JSON.stringify(correctAnswers)
    );

    // Count correct answers
    const correctCount = Object.values(responses).filter((response, index) => 
      response === correctAnswers[index]
    ).length;

    // Update performance metrics
    await memoryService.updatePerformanceMetrics(userId, courseId, {
      correctAnswers: correctCount,
      totalQuestions: Object.keys(responses).length,
      improvementAreas: improvementAreas.map(area => area.area)
    });

    logger.info(`Assessed exercises for user ${userId} in course ${courseId}`);
    
    return res.status(200).json({
      assessment,
      score: {
        correct: correctCount,
        total: Object.keys(responses).length,
        percentage: Math.round((correctCount / Object.keys(responses).length) * 100)
      },
      improvementAreas
    });
  } catch (error) {
    logger.error('Error assessing exercises:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to assess exercises'
      }
    });
  }
};

module.exports = exports;
