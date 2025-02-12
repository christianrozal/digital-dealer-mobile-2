import { Router, RequestHandler } from 'express';
import { getAssignmentHistory } from '../controllers/customer-log.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Get assignment history for a customer
router.get('/:customerId/history', authMiddleware as RequestHandler, getAssignmentHistory as RequestHandler);

export default router; 