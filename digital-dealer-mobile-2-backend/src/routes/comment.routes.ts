import { Router, RequestHandler } from 'express';
import { createComment, getCustomerComments, editComment, deleteComment } from '../controllers/comment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Create a new comment
router.post('/', authMiddleware as RequestHandler, createComment as RequestHandler);

// Get all comments for a customer
router.get('/customer/:customerId', authMiddleware as RequestHandler, getCustomerComments as RequestHandler);

// Edit a comment
router.patch('/:commentId', authMiddleware as RequestHandler, editComment as RequestHandler);

// Delete a comment
router.delete('/:commentId', authMiddleware as RequestHandler, deleteComment as RequestHandler);

export default router; 