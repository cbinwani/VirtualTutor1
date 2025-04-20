import express from 'express';
import { 
  getAllAvatars, 
  getAvatarById, 
  createAvatar, 
  updateAvatar, 
  deleteAvatar 
} from '../controllers/avatarController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllAvatars);
router.get('/:id', getAvatarById);

// Protected routes - admin only
router.post('/', protect, authorize('admin'), createAvatar);
router.put('/:id', protect, authorize('admin'), updateAvatar);
router.delete('/:id', protect, authorize('admin'), deleteAvatar);

export default router;
