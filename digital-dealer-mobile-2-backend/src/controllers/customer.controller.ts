import { Request, Response, RequestHandler } from 'express'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import slugify from 'slugify'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { name, email, phone, profile_image_url } = req.body;

    if (!customerId) {
      res.status(400).json({ error: 'Customer ID is required' });
      return;
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
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const getSignedUploadUrl: RequestHandler = async (req, res) => {
  try {
    const { fileType } = req.query;
    const { customerId } = req.params;

    if (!fileType) {
      res.status(400).json({ error: 'File type is required' });
      return;
    }

    // Ensure we have all required AWS configs
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
      console.error('Missing AWS configuration');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Generate key based on whether this is for a new or existing customer
    const key = customerId 
      ? `customer-profiles/${customerId}/${Date.now()}`
      : `customer-profiles/temp/${Date.now()}`;

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

    res.json({ signedUrl, imageUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

export const createCustomer: RequestHandler = async (req, res) => {
  const requestId = Date.now();
  const requestSequence = Math.random().toString(36).substring(7);
  
  console.log(`\n=== START REQUEST ${requestSequence} ===`);
  console.log(`[${requestId}] Request headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));

  try {
    const { name, email, phone } = req.body;

    if (!email) {
      console.log(`[${requestId}] [${requestSequence}] Email is required`);
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    console.log(`[${requestId}] [${requestSequence}] Checking for existing customer with email:`, email);
    const existingCustomer = await prisma.customer.findFirst({
      where: { email }
    });

    if (existingCustomer) {
      console.log(`[${requestId}] [${requestSequence}] Found existing customer:`, existingCustomer);
      
      // Only update fields that were provided in the request
      const updateData: any = {
        updated_at: new Date()
      };
      
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      
      // Update the existing customer's information if new data was provided
      const updatedCustomer = await prisma.customer.update({
        where: { id: existingCustomer.id },
        data: updateData
      });
      
      console.log(`[${requestId}] [${requestSequence}] Updated existing customer:`, updatedCustomer);
      console.log(`=== END REQUEST ${requestSequence} (existing customer updated) ===\n`);
      res.status(200).json(updatedCustomer);
      return;
    }

    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { slug }
      });

      if (!existingCustomer) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log(`[${requestId}] [${requestSequence}] Creating new customer with slug:`, slug);
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        slug
      }
    });

    console.log(`[${requestId}] [${requestSequence}] Successfully created customer:`, customer);
    console.log(`=== END REQUEST ${requestSequence} (new customer) ===\n`);
    res.status(201).json(customer);
  } catch (error) {
    console.error(`[${requestId}] [${requestSequence}] Error creating customer:`, error);
    console.log(`=== END REQUEST ${requestSequence} (error) ===\n`);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const getCustomerBySlug: RequestHandler = async (req, res) => {
  try {
    const { slug } = req.params;

    const customer = await prisma.customer.findFirst({
      where: { slug }
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const getCustomerById: RequestHandler = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      res.status(400).json({ error: 'Customer ID is required' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: {
        id: parseInt(customerId)
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profile_image_url: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomerWithScan: RequestHandler = async (req, res) => {
  const requestId = Date.now();
  const requestSequence = Math.random().toString(36).substring(7);
  
  console.log(`\n=== START REQUEST ${requestSequence} ===`);
  console.log(`[${requestId}] Request headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
  console.log(`[${requestId}] Request path:`, req.path);

  try {
    const { customer, customerScan } = req.body;

    if (!customer.name) {
      console.log(`[${requestId}] [${requestSequence}] Name is required`);
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!customerScan.user_id || !customerScan.dealership_brand_id) {
      console.log(`[${requestId}] [${requestSequence}] User ID and dealership brand ID are required`);
      res.status(400).json({ error: 'User ID and dealership brand ID are required' });
      return;
    }

    // Get dealership_id from dealership_brand
    const dealershipBrand = await prisma.dealershipBrand.findUnique({
      where: { id: customerScan.dealership_brand_id },
      select: { dealership_id: true }
    });

    if (!dealershipBrand) {
      console.log(`[${requestId}] [${requestSequence}] Dealership brand not found`);
      res.status(400).json({ error: 'Dealership brand not found' });
      return;
    }

    // Create base slug from name
    let baseSlug = slugify(customer.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (true) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { slug }
      });

      if (!existingCustomer) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create both customer and scan in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the customer
      const newCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone || null,
          profile_image_url: customer.profile_image_url || null,
          slug
        }
      });

      // Create the customer scan
      const newCustomerScan = await prisma.customerScan.create({
        data: {
          customer: {
            connect: {
              id: newCustomer.id
            }
          },
          user: {
            connect: {
              id: customerScan.user_id
            }
          },
          dealership: {
            connect: {
              id: dealershipBrand.dealership_id
            }
          },
          dealershipBrand: {
            connect: {
              id: customerScan.dealership_brand_id
            }
          },
          dealershipDepartment: customerScan.dealership_department_id ? {
            connect: {
              id: customerScan.dealership_department_id
            }
          } : undefined,
          interest_status: customerScan.interest_status,
          interested_in: customerScan.interested_in,
          follow_up_date: customerScan.follow_up_date ? new Date(customerScan.follow_up_date) : null
        }
      });

      return { customer: newCustomer, scan: newCustomerScan };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating customer with scan:', error);
    res.status(500).json({ error: 'Failed to create customer with scan' });
  }
};

export const checkCustomerByEmail: RequestHandler = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    res.json(customer);
  } catch (error) {
    console.error('Error checking customer:', error);
    res.status(500).json({ message: 'Error checking customer' });
  }
}; 