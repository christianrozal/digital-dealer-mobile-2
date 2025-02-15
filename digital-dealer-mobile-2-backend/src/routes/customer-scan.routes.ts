import { Router } from 'express'
import { 
  getUserScans, 
  getUniqueCustomers, 
  getCustomerScanDetails,
  getCustomerLogs,
  updateCustomerDetails,
  updateCustomerScan,
  createCustomerScan
} from '../controllers/customer-scan.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, createCustomerScan as any)
router.get('/user/:userId', authenticateToken, getUserScans as any)
router.get('/user/:userId/unique', authenticateToken, getUniqueCustomers as any)
router.get('/details/:customerId/:scanId', authenticateToken, getCustomerScanDetails as any)
router.get('/logs/:customerId', getCustomerLogs as any)
router.put('/details/:customerId', authenticateToken, updateCustomerDetails as any)
router.put('/scan/:scanId', authenticateToken, updateCustomerScan as any)

export default router 