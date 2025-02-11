import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthenticatedRequest } from '../types/auth'

const prisma = new PrismaClient()

export const getCustomerScansByUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = parseInt(req.params.userId)
    const brandId = req.query.brandId ? parseInt(req.query.brandId as string) : undefined
    const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined

    const customerScans = await prisma.customerScan.findMany({
      where: {
        user_id: userId,
        dealership_brand_id: brandId,
        ...(departmentId && { dealership_department_id: departmentId })
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return res.json(customerScans)
  } catch (error) {
    console.error('Error fetching customer scans:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 