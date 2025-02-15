import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:3000';

export const createQrCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { brandId, departmentId } = req.body;

    // Get the brand details
    const brand = await prisma.dealershipBrand.findUnique({
      where: { id: brandId },
      include: {
        departments: departmentId ? {
          where: { id: departmentId }
        } : undefined
      }
    });

    if (!brand) {
      res.status(404).json({ error: 'Brand not found' });
      return;
    }

    // If department ID was provided, verify it exists
    const department = departmentId ? brand.departments[0] : null;
    if (departmentId && !department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    // Create QR code record
    const qrCode = await prisma.qrCode.create({
      data: {
        dealership_brand_id: brandId,
        dealership_department_id: departmentId || null
      }
    });

    // Generate the URL based on the slug
    const slug = department ? department.slug : brand.slug;
    const url = `${WEBSITE_URL}/dealership/${slug}/signup`;

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(url);

    res.status(201).json({
      success: true,
      qrCode,
      qrCodeImage,
      url
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Failed to create QR code' });
  }
}; 