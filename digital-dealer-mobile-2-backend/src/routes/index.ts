import { Router } from 'express';
import userRoutes from './user.routes';
import customerRoutes from './customer.routes';
import appointmentRoutes from './appointment.routes';
import commentRoutes from './comment.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/api/users', userRoutes);
router.use('/api/customers', customerRoutes);
router.use('/api/appointments', appointmentRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/notifications', notificationRoutes);

export default router; 