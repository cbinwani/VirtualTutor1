import { Request, Response } from 'express';
import MemoryRecord from '../models/MemoryRecord';

// Get memory records for a user
export const getUserMemoryRecords = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { type, category } = req.query;
    
    const query: any = { userId };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    const memoryRecords = await MemoryRecord.find(query)
      .sort({ importance: -1, updatedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: memoryRecords.length,
      data: memoryRecords,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching memory records',
      error: error.message,
    });
  }
};

// Create a new memory record
export const createMemoryRecord = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    
    const { type, category, key, value, context, importance, expiresAt } = req.body;
    
    // Check if a record with the same key exists
    const existingRecord = await MemoryRecord.findOne({ userId, key });
    
    if (existingRecord) {
      // Update existing record
      existingRecord.value = value;
      existingRecord.importance = importance;
      existingRecord.context = context;
      existingRecord.accessCount += 1;
      existingRecord.lastAccessed = new Date();
      
      if (expiresAt) {
        existingRecord.expiresAt = expiresAt;
      }
      
      await existingRecord.save();
      
      return res.status(200).json({
        success: true,
        message: 'Memory record updated successfully',
        data: existingRecord,
      });
    }
    
    // Create new record
    const memoryRecord = new MemoryRecord({
      userId,
      type,
      category,
      key,
      value,
      context,
      importance,
      expiresAt,
      accessCount: 1,
      lastAccessed: new Date(),
    });
    
    await memoryRecord.save();
    
    res.status(201).json({
      success: true,
      message: 'Memory record created successfully',
      data: memoryRecord,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating memory record',
      error: error.message,
    });
  }
};

// Get a specific memory record by key
export const getMemoryRecordByKey = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { key } = req.params;
    
    const memoryRecord = await MemoryRecord.findOne({ userId, key });
    
    if (!memoryRecord) {
      return res.status(404).json({
        success: false,
        message: 'Memory record not found',
      });
    }
    
    // Update access count and last accessed
    memoryRecord.accessCount += 1;
    memoryRecord.lastAccessed = new Date();
    await memoryRecord.save();
    
    res.status(200).json({
      success: true,
      data: memoryRecord,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching memory record',
      error: error.message,
    });
  }
};

// Delete expired memory records
export const cleanupExpiredRecords = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const result = await MemoryRecord.deleteMany({
      expiresAt: { $lt: now },
    });
    
    res.status(200).json({
      success: true,
      message: 'Expired memory records cleaned up',
      count: result.deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error cleaning up expired memory records',
      error: error.message,
    });
  }
};
