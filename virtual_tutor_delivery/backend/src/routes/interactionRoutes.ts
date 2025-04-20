import express from 'express';
import { 
  createInteraction, 
  getSessionInteractions, 
  getRecentInteractions, 
  getContextInteractions 
} from '../controllers/interactionController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.post('/', protect, createInteraction);
router.get('/session/:sessionId', protect, getSessionInteractions);
router.get('/recent', protect, getRecentInteractions);
router.get('/context', protect, getContextInteractions);

export default router;
