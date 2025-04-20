import express from 'express';
import { 
  getUserMemoryRecords, 
  createMemoryRecord, 
  getMemoryRecordByKey, 
  cleanupExpiredRecords 
} from '../controllers/memoryController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/', protect, getUserMemoryRecords);
router.post('/', protect, createMemoryRecord);
router.get('/key/:key', protect, getMemoryRecordByKey);

// Admin only route
router.delete('/cleanup', protect, authorize('admin'), cleanupExpiredRecords);

export default router;
