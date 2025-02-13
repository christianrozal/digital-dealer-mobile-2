import { Router, RequestHandler } from 'express'
import { updateCustomer, getSignedUploadUrl } from '../controllers/customer.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.patch('/:customerId', authenticateToken as RequestHandler, updateCustomer as RequestHandler)
router.get('/:customerId/upload-url', authenticateToken as RequestHandler, getSignedUploadUrl as RequestHandler)

export default router 