import { Router } from 'express';
import { createAppointment } from '../controllers/appointment.controller';

const router = Router();

// Create appointment
router.post('/', createAppointment as any);

export default router; 