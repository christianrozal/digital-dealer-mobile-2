import { Router, RequestHandler } from 'express';
import { register, login, forgotPassword, getUserDealerships, getDealershipDepartments } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Auth routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/forgot-password', forgotPassword as RequestHandler);

// Protected routes for dealerships
router.get('/dealerships', authMiddleware as RequestHandler, getUserDealerships as RequestHandler);
router.get('/dealerships/:brandId/departments', authMiddleware as RequestHandler, getDealershipDepartments as RequestHandler);

export default router; 