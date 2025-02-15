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
  id: number;
  user_id: number;
  dealership_id?: number | null;
  dealership_brand_id?: number | null;
  dealership_department_id?: number | null;
  created_at: Date;
  updated_at: Date;
  dealership?: {
    id: number;
    name: string;
  } | null;
  dealershipBrand?: {
    id: number;
    name: string;
  } | null;
  dealershipDepartment?: {
    id: number;
    name: string;
  } | null;
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

type DealershipBrandWithRelations = Prisma.DealershipBrandGetPayload<{
  include: {
    dealership: true;
    departments: true;
  };
}>;

type DealershipDepartmentWithRelations = Prisma.DealershipDepartmentGetPayload<{
  include: {
    dealershipBrand: true;
  };
}>;

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role_id: true }
    });

    // If user is admin (role_id === 1), they can see all dealerships
    if (user?.role_id === 1) {
      const allBrands = await prisma.dealershipBrand.findMany({
        include: {
          dealership: true,
          departments: true
        },
        orderBy: { name: 'asc' }
      });
      return res.json(allBrands);
    }

    // For non-admin users, get their dealership access
    const userAccess = await prisma.userDealershipAccess.findMany({
      where: { user_id: userId },
      include: {
        dealership: true,
        dealershipBrand: {
          include: {
            dealership: true,
            departments: true
          }
        }
      }
    });

    if (!userAccess || userAccess.length === 0) {
      return res.status(404).json({ 
        message: 'No dealership brands found',
        details: 'No dealership brands are accessible to this user'
      });
    }

    // Get all accessible brands
    const accessibleBrands = userAccess
      .filter(access => access.dealershipBrand)
      .map(access => access.dealershipBrand!);

    // Get all accessible dealerships (when user has dealership-level access)
    const dealershipAccess = userAccess
      .filter(access => access.dealership && !access.dealership_brand_id)
      .map(access => access.dealership!.id);

    if (dealershipAccess.length > 0) {
      // If user has dealership-level access, get all brands for those dealerships
      const dealershipBrands = await prisma.dealershipBrand.findMany({
        where: {
          dealership_id: {
            in: dealershipAccess
          }
        },
        include: {
          dealership: true,
          departments: true
        },
        orderBy: { name: 'asc' }
      });

      // Combine with directly accessible brands, removing duplicates
      const allAccessibleBrands = [
        ...accessibleBrands,
        ...dealershipBrands
      ].filter((brand, index, self) => 
        index === self.findIndex((b) => b.id === brand.id)
      );

      return res.json(allAccessibleBrands);
    }

    // If no dealership-level access, return only directly accessible brands
    return res.json(accessibleBrands);

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
    const userId = req.user?.id;
    const brandId = parseInt(req.params.brandId);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!brandId || isNaN(brandId)) {
      return res.status(400).json({ message: 'Invalid brand ID' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role_id: true }
    });

    // If user is admin, they can see all departments
    if (user?.role_id === 1) {
      const departments = await prisma.dealershipDepartment.findMany({
        where: {
          dealership_brand_id: brandId
        },
        include: {
          dealershipBrand: {
            include: {
              dealership: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });
      return res.json(departments);
    }

    // For non-admin users, check their access
    const userAccess = await prisma.userDealershipAccess.findMany({
      where: { 
        user_id: userId,
        OR: [
          { dealership_brand_id: brandId },
          { dealership_department_id: { not: null } },
          { 
            dealership_id: { not: null }
          }
        ]
      },
      include: {
        dealershipDepartment: true,
        dealershipBrand: {
          include: {
            dealership: true
          }
        },
        dealership: true
      }
    });

    if (!userAccess || userAccess.length === 0) {
      return res.status(404).json({
        message: 'No departments found',
        details: 'No departments are accessible to this user'
      });
    }

    // Get departments based on different access levels
    const accessibleDepartmentIds = new Set<number>();

    // Get all accessible departments
    const departmentsPromises = userAccess.map(async (access) => {
      // If user has department-level access
      if (access.dealership_department_id) {
        accessibleDepartmentIds.add(access.dealership_department_id);
      }
      
      // If user has brand-level access
      if (access.dealership_brand_id === brandId) {
        const brandDepartments = await prisma.dealershipDepartment.findMany({
          where: { dealership_brand_id: brandId }
        });
        brandDepartments.forEach(dept => accessibleDepartmentIds.add(dept.id));
      }
      
      // If user has dealership-level access and the brand belongs to their dealership
      if (access.dealership_id && access.dealershipBrand?.dealership_id === access.dealership_id) {
        const dealershipDepartments = await prisma.dealershipDepartment.findMany({
          where: { dealership_brand_id: brandId }
        });
        dealershipDepartments.forEach(dept => accessibleDepartmentIds.add(dept.id));
      }
    });

    // Wait for all department queries to complete
    await Promise.all(departmentsPromises);

    // Fetch the actual department data for accessible departments
    const departments = await prisma.dealershipDepartment.findMany({
      where: {
        id: { in: Array.from(accessibleDepartmentIds) },
        dealership_brand_id: brandId
      },
      include: {
        dealershipBrand: {
          include: {
            dealership: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (!departments || departments.length === 0) {
      return res.status(404).json({
        message: 'No departments found',
        details: `No accessible departments found for brand ID ${brandId}`
      });
    }

    return res.json(departments);
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      message: 'Error fetching departments',
      details: error?.message || 'Unknown error'
    });
  }
}; 