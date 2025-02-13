import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const { name, email, phone, profile_image_url } = req.body

    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }

    // Get the current customer to check if we need to delete an old image
    const currentCustomer = await prisma.customer.findUnique({
      where: {
        id: parseInt(customerId)
      }
    });

    // If there's an existing image and we're changing it, delete the old one
    if (currentCustomer?.profile_image_url && 
        profile_image_url !== undefined && 
        profile_image_url !== currentCustomer.profile_image_url) {
      try {
        // Extract the key from the old image URL
        const oldKey = currentCustomer.profile_image_url.split('/').slice(-2).join('/');
        
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

    const updatedCustomer = await prisma.customer.update({
      where: {
        id: parseInt(customerId)
      },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(profile_image_url !== undefined && { profile_image_url }),
        updated_at: new Date()
      }
    })

    res.json(updatedCustomer)
  } catch (error) {
    console.error('Error updating customer:', error)
    res.status(500).json({ error: 'Failed to update customer' })
  }
}

export const getSignedUploadUrl = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params
    const { fileType } = req.query

    if (!fileType) {
      return res.status(400).json({ error: 'File type is required' })
    }

    // Ensure we have all required AWS configs
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
      console.error('Missing AWS configuration')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const key = `customer-profiles/${customerId}-${Date.now()}`

    // Configure the upload command with minimal required parameters
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: fileType as string
    })

    // Generate signed URL with content-type header only
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
      signableHeaders: new Set(['content-type'])
    })
    
    // Use path-style URL format
    const imageUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET}/${key}`

    console.log('Generated signed URL for upload:', {
      bucket: process.env.AWS_S3_BUCKET,
      key,
      contentType: fileType,
      imageUrl,
      signedUrl
    })

    res.json({ signedUrl, imageUrl })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    res.status(500).json({ error: 'Failed to generate upload URL' })
  }
} 