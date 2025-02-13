import { Router } from 'express';
import { getUserProfile, updateUserProfile, getSignedUploadUrl } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, getUserProfile as any);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile as any);

// Get signed URL for profile image upload
router.get('/profile/upload-url', authenticateToken, getSignedUploadUrl as any);

export default router; 