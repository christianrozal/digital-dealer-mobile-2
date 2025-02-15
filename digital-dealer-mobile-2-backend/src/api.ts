import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middleware/auth.middleware';
import customerScanRoutes from './routes/customer-scan.routes';
import customerRoutes from './routes/customer.routes';
import commentRoutes from './routes/comment.routes';
import customerLogRoutes from './routes/customer-log.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role_id: number;
  };
}

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

// Configure CORS with specific options
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root route - no auth required
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Digital Dealer Mobile API',
    version: '1.0.0',
    status: 'running'
  });
});

// Health check endpoint - no auth required
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-scans', customerScanRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/customer-logs', customerLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Get current user
app.get('/api/users/me', authMiddleware as any, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get dealership info
app.get('/api/dealership-info', authMiddleware as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const dealership = await prisma.dealership.findFirst({
      select: {
        id: true,
        name: true
      }
    });

    if (!dealership) {
      res.status(404).json({ message: 'Dealership not found' });
      return;
    }

    res.json(dealership);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all dealership brands
app.get('/api/dealership-brands', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brands = await prisma.dealershipBrand.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(brands);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all dealership departments
app.get('/api/dealership-departments', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await prisma.dealershipDepartment.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get departments by brand ID
app.get('/api/dealership-brands/:brandId/departments', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const departments = await prisma.dealershipDepartment.findMany({
      where: {
        dealership_brand_id: parseInt(req.params.brandId)
      },
      orderBy: { name: 'asc' }
    });
    res.json(departments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
