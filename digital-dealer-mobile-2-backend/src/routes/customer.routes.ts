import { Router } from 'express'
import { 
  updateCustomer, 
  getSignedUploadUrl, 
  createCustomer, 
  getCustomerBySlug, 
  getCustomerById,
  createCustomerWithScan,
  checkCustomerByEmail
} from '../controllers/customer.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Upload routes first
router.get('/upload-url', authenticateToken as any, getSignedUploadUrl) // Generic upload URL for new customers
router.get('/:customerId/upload-url', authenticateToken as any, getSignedUploadUrl) // Customer-specific upload URL

// Other specific routes
router.patch('/:customerId', updateCustomer)
router.get('/id/:customerId', authenticateToken as any, getCustomerById)
router.post('/with-scan', authenticateToken as any, createCustomerWithScan)
router.post('/', createCustomer as any)

// Check customer by email
router.get('/check', checkCustomerByEmail as any)

// Catch-all slug route last
router.get('/:slug', getCustomerBySlug)

export default router 