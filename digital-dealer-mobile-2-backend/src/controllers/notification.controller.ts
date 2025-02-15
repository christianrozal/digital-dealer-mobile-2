import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleError } from '../utils/error';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.query.userId as string);

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      include: {
        dealership: true,
        dealershipBrand: true,
        dealershipDepartment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_image_url: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    handleError(error, res);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        user_id: userId,
        read: false,
      },
      data: {
        read: true,
        updated_at: new Date(),
      },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    handleError(error, res);
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { type, userId, dealershipId, dealershipBrandId, dealershipDepartmentId } = req.body;

    if (!type || !userId) {
      res.status(400).json({ error: 'Type and user ID are required' });
      return;
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        user_id: userId,
        dealership_id: dealershipId,
        dealership_brand_id: dealershipBrandId,
        dealership_department_id: dealershipDepartmentId,
        read: false,
      },
      include: {
        dealership: true,
        dealershipBrand: true,
        dealershipDepartment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile_image_url: true,
          },
        },
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    handleError(error, res);
  }
}; 