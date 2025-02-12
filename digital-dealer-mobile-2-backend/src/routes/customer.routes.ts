import { RequestHandler, Router } from 'express'
import { updateCustomer } from '../controllers/customer.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.patch('/:id', authMiddleware as RequestHandler, updateCustomer as RequestHandler)

export default router 