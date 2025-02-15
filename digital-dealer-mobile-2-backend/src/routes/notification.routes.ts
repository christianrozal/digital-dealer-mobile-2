import express, { RequestHandler } from 'express';
import { getNotifications, markAllAsRead, createNotification } from '../controllers/notification.controller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get notifications for a user
router.get('/', authenticateToken, getNotifications as RequestHandler);

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, markAllAsRead as RequestHandler);

// Create a new notification
router.post('/', createNotification as RequestHandler);

export default router; 