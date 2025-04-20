import { Request, Response } from 'express';
import Interaction from '../models/Interaction';

// Create a new interaction
export const createInteraction = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    
    const { sessionId, type, content, context, metadata } = req.body;
    
    const interaction = new Interaction({
      userId,
      sessionId,
      type,
      content,
      context,
      metadata,
      timestamp: new Date(),
    });
    
    await interaction.save();
    
    res.status(201).json({
      success: true,
      message: 'Interaction recorded successfully',
      data: interaction,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error recording interaction',
      error: error.message,
    });
  }
};

// Get interactions for a session
export const getSessionInteractions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { sessionId } = req.params;
    
    const interactions = await Interaction.find({
      userId,
      sessionId,
    }).sort({ timestamp: 1 });
    
    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interactions',
      error: error.message,
    });
  }
};

// Get recent interactions for a user
export const getRecentInteractions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const interactions = await Interaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent interactions',
      error: error.message,
    });
  }
};

// Get interactions by context (course, lesson, exercise)
export const getContextInteractions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { courseId, lessonId, exerciseId } = req.query;
    
    const query: any = { userId };
    
    if (courseId) {
      query['context.courseId'] = courseId;
    }
    
    if (lessonId) {
      query['context.lessonId'] = lessonId;
    }
    
    if (exerciseId) {
      query['context.exerciseId'] = exerciseId;
    }
    
    const interactions = await Interaction.find(query)
      .sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      count: interactions.length,
      data: interactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching context interactions',
      error: error.message,
    });
  }
};
