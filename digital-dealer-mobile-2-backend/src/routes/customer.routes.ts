import { Router, RequestHandler } from 'express'
import { updateCustomer, getSignedUploadUrl, createCustomer, getCustomerBySlug, getCustomerById } from '../controllers/customer.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Specific routes first
router.patch('/:customerId', authenticateToken as RequestHandler, updateCustomer as RequestHandler)
router.get('/:customerId/upload-url', authenticateToken as RequestHandler, getSignedUploadUrl as RequestHandler)
router.get('/id/:customerId', authenticateToken as RequestHandler, getCustomerById as RequestHandler)
router.post('/', createCustomer as RequestHandler)

// Catch-all slug route last
router.get('/:slug', getCustomerBySlug as RequestHandler)

export default router 