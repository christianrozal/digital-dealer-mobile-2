import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role_id: number;
  };
}

interface UserDealershipAccess {
  user_id: number;
  entity_id: number;
  EntityType: {
    id: number;
    entity_name: string;
    entity_id: number;
  };
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone,
        role_id: 1, // Default role
        slug: email.split('@')[0]
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role_id: true,
        passwordHash: true,
        slug: true
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role_id: user.role_id,
        name: user.name,
        slug: user.slug
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        slug: user.slug
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        resetToken,
        resetTokenExpires
      }
    });

    // In a real app, send email with reset link
    // For now, just return the token
    res.json({ message: 'Password reset token generated' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
};

export const getUserDealerships = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // First, get the user's role to check if they're an admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role_id: true }
    });

    // If user is an admin (role_id 1), get all dealership brands
    if (user?.role_id === 1) {
      const allBrands = await prisma.dealershipBrand.findMany({
        orderBy: { name: 'asc' }
      });
      
      // Get dealership info separately
      const dealerships = await prisma.dealership.findMany({
        where: {
          id: {
            in: allBrands.map(brand => brand.dealership_id)
          }
        },
        select: {
          id: true,
          name: true
        }
      });

      // Combine the data
      const brandsWithDealerships = allBrands.map(brand => ({
        ...brand,
        dealership: dealerships.find(d => d.id === brand.dealership_id)
      }));

      return res.json(brandsWithDealerships);
    }

    // For non-admin users, get all brands (temporary)
    const dealershipBrands = await prisma.dealershipBrand.findMany({
      orderBy: { name: 'asc' }
    });

    // Get dealership info separately
    const dealerships = await prisma.dealership.findMany({
      where: {
        id: {
          in: dealershipBrands.map(brand => brand.dealership_id)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Combine the data
    const brandsWithDealerships = dealershipBrands.map(brand => ({
      ...brand,
      dealership: dealerships.find(d => d.id === brand.dealership_id)
    }));

    if (!brandsWithDealerships || brandsWithDealerships.length === 0) {
      return res.status(404).json({ 
        message: 'No dealership brands found',
        details: 'The dealership brands table is empty'
      });
    }

    return res.json(brandsWithDealerships);
  } catch (error: any) {
    console.error('Error fetching dealerships:', error);
    res.status(500).json({ 
      message: 'Error fetching dealerships',
      details: error?.message || 'Unknown error'
    });
  }
};

export const getDealershipDepartments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const brandId = parseInt(req.params.brandId);

    if (!brandId || isNaN(brandId)) {
      return res.status(400).json({ message: 'Invalid brand ID' });
    }

    // TEMPORARY: For testing, get all departments for the brand without access check
    console.log('🔍 TESTING MODE: Fetching departments for brand:', brandId);
    const departments = await prisma.dealershipDepartment.findMany({
      where: {
        dealership_brand_id: brandId
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log('📦 Departments found:', departments);
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
}; 