import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { 
      date, 
      notes, 
      user_id, 
      customer_id, 
      dealership_brand_id,
      dealership_department_id 
    } = req.body;

    if (!date || !user_id || !customer_id || !dealership_brand_id) {
      return res.status(400).json({ 
        message: 'Date, user_id, customer_id, and dealership_brand_id are required' 
      });
    }

    // Validate date
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        notes,
        user_id: parseInt(user_id),
        customer_id: parseInt(customer_id),
        dealership_brand_id: parseInt(dealership_brand_id),
        ...(dealership_department_id && {
          dealership_department_id: parseInt(dealership_department_id)
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
        dealershipBrand: {
          select: {
            name: true,
            dealership: {
              select: {
                name: true,
              },
            },
          },
        },
        dealershipDepartment: dealership_department_id ? {
          select: {
            name: true,
          },
        } : false,
      },
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ message: 'Error creating appointment' });
  }
}; 