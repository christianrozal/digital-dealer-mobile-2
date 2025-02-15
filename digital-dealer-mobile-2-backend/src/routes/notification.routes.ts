import express from 'express';
import { getNotifications, markAllAsRead, createNotification } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get notifications for a user
router.get('/', authenticateToken, getNotifications);

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, markAllAsRead);

// Create a new notification
router.post('/', authenticateToken, createNotification);

export default router; 