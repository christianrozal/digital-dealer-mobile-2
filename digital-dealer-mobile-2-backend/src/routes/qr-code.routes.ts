import { Router } from 'express';
import { createQrCode } from '../controllers/qr-code.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Create a new QR code for a brand or department
router.post('/', authenticateToken, createQrCode);

export default router; 