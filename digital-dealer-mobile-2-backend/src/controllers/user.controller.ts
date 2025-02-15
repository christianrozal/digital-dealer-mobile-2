import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role_id: number;
    };
}

const prisma = new PrismaClient();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
});

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profile_image_url: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ message: 'Error fetching user profile' });
    }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, phone, profile_image_url } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get current user to check if we need to delete old image
        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        // If there's an existing image and we're changing it, delete the old one
        if (currentUser?.profile_image_url && 
            profile_image_url !== undefined && 
            profile_image_url !== currentUser.profile_image_url) {
            try {
                // Extract the key from the old image URL
                const oldKey = currentUser.profile_image_url.split('/').slice(-2).join('/');
                
                // Delete the old image from S3
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET!,
                    Key: oldKey
                }));

                console.log('Deleted old image:', oldKey);
            } catch (deleteError) {
                // Log the error but don't fail the update
                console.error('Error deleting old image:', deleteError);
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name !== undefined && { name }),
                ...(phone !== undefined && { phone }),
                ...(profile_image_url !== undefined && { profile_image_url }),
                updated_at: new Date()
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                profile_image_url: true,
                role: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ message: 'Error updating user profile' });
    }
};

export const getSignedUploadUrl = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fileType } = req.query;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!fileType) {
            return res.status(400).json({ error: 'File type is required' });
        }

        // Ensure we have all required AWS configs
        if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
            console.error('Missing AWS configuration');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const key = `user-profiles/${userId}-${Date.now()}`;

        // Configure the upload command
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            ContentType: fileType as string
        });

        // Generate signed URL
        const signedUrl = await getSignedUrl(s3Client, command, { 
            expiresIn: 3600,
            signableHeaders: new Set(['content-type'])
        });
        
        // Use path-style URL format
        const imageUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET}/${key}`;

        return res.json({ signedUrl, imageUrl });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
};

export const getUsersByBrand = async (req: Request, res: Response) => {
    try {
        const brandId = parseInt(req.params.brandId);

        if (isNaN(brandId)) {
            return res.status(400).json({ message: 'Invalid brand ID' });
        }

        const users = await prisma.user.findMany({
            where: {
                dealershipAccess: {
                    some: {
                        OR: [
                            { dealership_brand_id: brandId },
                            {
                                dealership: {
                                    brands: {
                                        some: {
                                            id: brandId
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                profile_image_url: true,
                phone: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return res.json(users);
    } catch (error) {
        console.error('Error fetching users by brand:', error);
        return res.status(500).json({ message: 'Error fetching users' });
    }
}; 