import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role_id: number;
    };
}

export const getAssignmentHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        // Get all customer logs for this customer
        const customerLogs = await prisma.customerLog.findMany({
            where: {
                customer_id: parseInt(customerId)
            },
            include: {
                customer: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        if (customerLogs.length === 0) {
            return res.json([]);
        }

        // Get all unique user IDs from logs (current and prior)
        const allUserIds = new Set<number>();
        customerLogs.forEach(log => {
            allUserIds.add(log.currentuser_id);
            log.prioruser_ids.forEach(id => allUserIds.add(id));
        });

        // Fetch all users involved
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: Array.from(allUserIds)
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                profile_image_url: true
            }
        });

        // Create a map of user IDs to user data for easy lookup
        const userMap = new Map(users.map(user => [user.id, user]));

        // Process logs to create assignment history
        // We'll track user changes to avoid consecutive entries for the same user
        const assignmentHistory = [];
        let lastUserId: number | null = null;

        // Add first assignment
        const firstLog = customerLogs[0];
        assignmentHistory.push({
            type: 'INITIAL_ASSIGNMENT',
            user: userMap.get(firstLog.currentuser_id),
            timestamp: firstLog.created_at,
            customer_name: firstLog.customer.name
        });
        lastUserId = firstLog.currentuser_id;

        // Process reassignments
        customerLogs.forEach(log => {
            // Check prior users in reverse order (most recent first)
            [...log.prioruser_ids].reverse().forEach(userId => {
                if (userId !== lastUserId) {
                    assignmentHistory.push({
                        type: 'REASSIGNMENT',
                        user: userMap.get(userId),
                        timestamp: log.created_at,
                        customer_name: log.customer.name
                    });
                    lastUserId = userId;
                }
            });

            // Add current user if different from last added
            if (log.currentuser_id !== lastUserId) {
                assignmentHistory.push({
                    type: 'REASSIGNMENT',
                    user: userMap.get(log.currentuser_id),
                    timestamp: log.created_at,
                    customer_name: log.customer.name
                });
                lastUserId = log.currentuser_id;
            }
        });

        res.json(assignmentHistory);
    } catch (error) {
        console.error('Error fetching assignment history:', error);
        res.status(500).json({ error: 'Failed to fetch assignment history' });
    }
}; 