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

export const createComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { customerId, comment } = req.body;
        const userId = req.user?.id;

        if (!userId || !customerId || !comment) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // First, find or create a CustomerLog for this customer
        let customerLog = await prisma.customerLog.findFirst({
            where: {
                customer_id: customerId,
                currentuser_id: userId
            }
        });

        if (!customerLog) {
            customerLog = await prisma.customerLog.create({
                data: {
                    customer_id: customerId,
                    currentuser_id: userId,
                    prioruser_ids: []
                }
            });
        }

        // Create the comment
        const newComment = await prisma.comment.create({
            data: {
                comment_text: comment,
                customerlog_id: customerLog.id,
                user_id: userId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        profile_image_url: true
                    }
                }
            }
        });

        res.json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Failed to create comment' });
    }
};

export const getCustomerComments = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        // Get all customer logs for this customer
        const customerLogs = await prisma.customerLog.findMany({
            where: {
                customer_id: parseInt(customerId)
            }
        });

        // Get all comments from these logs
        const comments = await prisma.comment.findMany({
            where: {
                customerlog_id: {
                    in: customerLogs.map(log => log.id)
                }
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        profile_image_url: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching customer comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};

export const editComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const { comment_text } = req.body;
        const userId = req.user?.id;

        if (!userId || !commentId || !comment_text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the comment exists and belongs to the user
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: parseInt(commentId),
                user_id: userId
            }
        });

        if (!existingComment) {
            return res.status(403).json({ error: 'Not authorized to edit this comment' });
        }

        // Update the comment
        const updatedComment = await prisma.comment.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                comment_text,
                updated_at: new Date()
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        profile_image_url: true
                    }
                }
            }
        });

        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Failed to update comment' });
    }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?.id;

        if (!userId || !commentId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the comment exists and belongs to the user
        const existingComment = await prisma.comment.findFirst({
            where: {
                id: parseInt(commentId),
                user_id: userId
            }
        });

        if (!existingComment) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        // Delete the comment
        await prisma.comment.delete({
            where: {
                id: parseInt(commentId)
            }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
}; 