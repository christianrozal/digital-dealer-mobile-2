import { Router } from 'express'
import { getCustomerScansByUser } from '../controllers/customer-scan.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/user/:userId', authMiddleware, getCustomerScansByUser)

export default router 