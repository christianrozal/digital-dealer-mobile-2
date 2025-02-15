import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getEntityBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Try to find department first
    const department = await prisma.dealershipDepartment.findFirst({
      where: { slug },
      include: {
        dealershipBrand: {
          include: {
            dealership: true
          }
        }
      }
    });

    if (department) {
      return res.json({
        name: department.name,
        type: 'department',
        dealershipName: department.dealershipBrand.dealership.name,
        brandName: department.dealershipBrand.name
      });
    }

    // If not department, try to find brand
    const brand = await prisma.dealershipBrand.findFirst({
      where: { slug },
      include: {
        dealership: true
      }
    });

    if (brand) {
      return res.json({
        name: brand.name,
        type: 'brand',
        dealershipName: brand.dealership.name
      });
    }

    return res.status(404).json({ error: 'Entity not found' });
  } catch (error) {
    console.error('Error fetching entity:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 