import { Router } from 'express';
import { createDealershipScan } from '../controllers/dealership-scan.controller';

const router = Router();

// Create a new dealership scan
router.post('/', createDealershipScan);

export default router; 