import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleError } from '../utils/error';
import { emitNewNotification } from '../websocket';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { user_id, limit = '20', offset = '0' } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: parseInt(user_id as string),
      },
      include: {
        user: {
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
        dealershipDepartment: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    return res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Notification ID is required' });
    }

    const notification = await prisma.notification.update({
      where: {
        id: parseInt(id),
      },
      data: {
        read: true,
        updated_at: new Date(),
      },
    });

    return res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Error marking notification as read' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { type, user_id, metadata, dealership_brand_id, dealership_department_id } = req.body;

    if (!type || !user_id) {
      return res.status(400).json({ message: 'Type and user_id are required' });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        user_id: parseInt(user_id),
        dealership_brand_id: dealership_brand_id ? parseInt(dealership_brand_id) : null,
        dealership_department_id: dealership_department_id ? parseInt(dealership_department_id) : null,
        metadata,
      },
      include: {
        user: {
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

    // Emit the new notification event with full notification data
    console.log('Emitting new notification:', notification);
    emitNewNotification(notification);

    console.log('Notification created successfully:', notification);
    return res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Error creating notification' });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    await prisma.notification.updateMany({
      where: {
        user_id: parseInt(user_id as string),
        read: false
      },
      data: {
        read: true,
        updated_at: new Date()
      }
    });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Error marking all notifications as read' });
  }
}; 