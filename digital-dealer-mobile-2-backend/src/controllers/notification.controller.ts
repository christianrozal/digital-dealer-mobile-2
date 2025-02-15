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
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update all unread notifications for the user
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

    // Return updated notifications
    const updatedNotifications = await prisma.notification.findMany({
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
    });

    res.json(updatedNotifications);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    handleError(error, res);
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    console.log('Creating notification with data:', req.body);

    // Validate required fields
    const { type, userId, metadata } = req.body;
    if (!type || !userId) {
      return res.status(400).json({ error: 'Type and userId are required fields' });
    }

    // Create the notification with proper field mapping
    const notification = await prisma.notification.create({
      data: {
        type: req.body.type,
        user_id: req.body.userId,
        dealership_id: req.body.dealershipId || null,
        dealership_brand_id: req.body.dealershipBrandId || null,
        dealership_department_id: req.body.dealershipDepartmentId || null,
        metadata: req.body.metadata as Prisma.JsonValue || {},
        read: false
      },
      include: {
        dealership: true,
        dealershipBrand: true,
        dealershipDepartment: true,
        user: true,
      },
    });

    // Emit the new notification event with full notification data
    console.log('Emitting new notification:', notification);
    emitNewNotification(notification);

    console.log('Notification created successfully:', notification);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification', details: error });
  }
}; 