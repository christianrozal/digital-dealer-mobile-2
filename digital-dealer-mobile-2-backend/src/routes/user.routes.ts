import { Router } from 'express';
import { getUserProfile, updateUserProfile, getSignedUploadUrl, getUsersByBrand, getConsultantBySlug } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, getUserProfile as any);

// Update user profile
router.put('/profile', authenticateToken, updateUserProfile as any);

// Get signed URL for profile image upload
router.get('/profile/upload-url', authenticateToken, getSignedUploadUrl as any);

// Get users by brand
router.get('/brand/:brandId', authenticateToken, getUsersByBrand as any);

// Get consultant by slug (public route, no auth required)
router.get('/consultant/:slug', getConsultantBySlug as any);

export default router; 