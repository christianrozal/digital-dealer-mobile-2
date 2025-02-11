import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getCustomerScansByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId)
    const customerScans = await prisma.customerScan.findMany({
      where: {
        user_id: userId
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
    res.json(customerScans)
  } catch (error) {
    console.error('Error fetching customer scans:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 