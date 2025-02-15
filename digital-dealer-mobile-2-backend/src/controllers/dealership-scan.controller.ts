import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../utils/helpers';

const prisma = new PrismaClient();

export const createDealershipScan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, entitySlug, customerId } = req.body;

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Try to find department first
      const department = await tx.dealershipDepartment.findFirst({
        where: { slug: entitySlug },
        include: {
          dealershipBrand: true
        }
      });

      // Find the QR code based on brand and optionally department
      const qrCode = await tx.qrCode.findFirst({
        where: department ? {
          dealership_brand_id: department.dealership_brand_id,
          dealership_department_id: department.id
        } : {
          dealershipBrand: {
            slug: entitySlug
          },
          dealership_department_id: null
        }
      });

      if (!qrCode) {
        throw new Error('Invalid entity');
      }

      // If customerId is provided, use that customer
      let customer;
      if (customerId) {
        customer = await tx.customer.findUnique({
          where: { id: customerId }
        });
        
        if (!customer) {
          throw new Error('Customer not found');
        }
        
        // Update customer information if provided
        customer = await tx.customer.update({
          where: { id: customerId },
          data: {
            name: name || customer.name,
            email: email || customer.email,
            phone: phone || customer.phone,
            updated_at: new Date()
          }
        });
      } else {
        // Check for existing customer by email
        if (email) {
          customer = await tx.customer.findFirst({
            where: { email }
          });
        }

        if (customer) {
          // Update existing customer
          customer = await tx.customer.update({
            where: { id: customer.id },
            data: {
              name: name || customer.name,
              phone: phone || customer.phone,
              updated_at: new Date()
            }
          });
        } else {
          // Create new customer if none exists
          let baseSlug = slugify(name);
          let slug = baseSlug;
          let counter = 1;

          while (true) {
            const existingCustomer = await tx.customer.findFirst({
              where: { slug }
            });

            if (!existingCustomer) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          customer = await tx.customer.create({
            data: {
              name,
              email,
              phone,
              slug
            }
          });
        }
      }

      // Create dealership scan
      const scan = await tx.dealershipScan.create({
        data: {
          qrcode_id: qrCode.id,
          customer_id: customer.id,
          submitted_at: new Date(),
          form_data: {
            name,
            email,
            phone,
            submission_date: new Date().toISOString()
          }
        }
      });

      return { customer, scan };
    });

    res.status(201).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error creating scan:', error);
    if (error instanceof Error && error.message === 'Invalid entity') {
      res.status(404).json({ error: 'Invalid entity' });
    } else if (error instanceof Error && error.message === 'Customer not found') {
      res.status(404).json({ error: 'Customer not found' });
    } else {
      res.status(500).json({ error: 'Failed to create scan' });
    }
  }
}; 