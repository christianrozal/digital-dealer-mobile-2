import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, phone } = req.body

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name,
        email,
        phone,
        updated_at: new Date()
      }
    })

    res.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    res.status(500).json({ error: 'Failed to update customer' })
  }
} 