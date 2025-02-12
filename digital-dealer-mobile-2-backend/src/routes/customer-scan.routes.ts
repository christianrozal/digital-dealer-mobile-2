import { RequestHandler, Router } from 'express'
import { getCustomerScansByUser, getUniqueCustomers, getCustomerScanDetails } from '../controllers/customer-scan.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/user/:userId', authMiddleware as RequestHandler, getCustomerScansByUser as RequestHandler)
router.get('/user/:userId/unique-customers', authMiddleware as RequestHandler, getUniqueCustomers as RequestHandler)
router.get('/:customerId/:scanId', authMiddleware as RequestHandler, getCustomerScanDetails as RequestHandler<{ customerId: string; scanId: string }>)

export default router 