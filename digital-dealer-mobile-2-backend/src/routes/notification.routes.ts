import { Router } from 'express';
import { 
  createNotification, 
  getNotifications, 
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notification.controller';

const router = Router();

// Create notification
router.post('/', createNotification as any);

// Get user's notifications with pagination
router.get('/', getNotifications as any);

// Mark notification as read
router.patch('/:id/read', markNotificationAsRead as any);

// Mark all notifications as read for a user
router.patch('/mark-all-read', markAllNotificationsAsRead as any);

export default router; 