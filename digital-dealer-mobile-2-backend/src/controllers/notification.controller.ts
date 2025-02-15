import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { handleError } from '../utils/error';
import { emitNewNotification } from '../websocket';

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
    const notification = await prisma.notification.create({
      data: {
        ...req.body,
        metadata: req.body.metadata || {},
      },
      include: {
        dealership: true,
        dealershipBrand: true,
        dealershipDepartment: true,
        user: true,
      },
    });

    // Emit the new notification event
    emitNewNotification(notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
}; 