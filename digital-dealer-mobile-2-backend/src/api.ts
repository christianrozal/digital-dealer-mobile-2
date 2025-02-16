import express, { Request, Response, NextFunction, RequestHandler } from 'express';
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
import dealershipScanRoutes from './routes/dealership-scan.routes';
import qrCodeRoutes from './routes/qr-code.routes';
import appointmentRoutes from './routes/appointment.routes';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role_id: number;
  };
}

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\nIncoming ${req.method} request to ${req.url} at ${new Date().toISOString()}`);
  next();
});

// Configure CORS - must be before any routes
app.use(cors({
  origin: [
    'https://digital-dealer-mobile-2-website.vercel.app',
    'https://digital-dealer-mobile-2-website-git-main-chans-projects.vercel.app',
    'https://digital-dealer-mobile-2-website-*.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://172.16.20.0:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Upgrade', 
    'Connection', 
    'Sec-WebSocket-Key', 
    'Sec-WebSocket-Version',
    'Sec-WebSocket-Extensions',
    'Sec-WebSocket-Protocol'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Parse JSON bodies
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
app.use('/api/customers', customerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/customer-logs', customerLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dealership-scans', dealershipScanRoutes);
app.use('/api/qr-codes', qrCodeRoutes);
app.use('/api/appointments', appointmentRoutes);

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

const getDealershipDepartments: RequestHandler = async (req, res, next) => {
  try {
    console.log('Fetching dealership departments...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test Prisma connection
    try {
      await prisma.$connect();
      console.log('Successfully connected to database');
    } catch (connError) {
      console.error('Database connection failed:', connError);
      throw connError;
    }

    const departments = await prisma.dealershipDepartment.findMany({
      include: {
        dealershipBrand: {
          include: {
            dealership: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!departments || departments.length === 0) {
      console.log('No departments found');
      res.status(404).json({ 
        success: false, 
        error: 'No departments found' 
      });
      return;
    }

    console.log(`Found ${departments.length} departments`);
    res.status(200).json({ 
      success: true, 
      data: departments 
    });
    return;

  } catch (error) {
    console.error('Error fetching dealership departments:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dealership departments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  } finally {
    // Always disconnect to prevent connection pool issues
    await prisma.$disconnect();
  }
};

app.get('/api/dealership-departments', getDealershipDepartments);

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

// Set up WebSocket server without path restriction
const wss = setupWebSocketServer(server);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('WebSocket server is available at:');
  console.log(`  ws://localhost:${port}`);
  console.log(`  ws://127.0.0.1:${port}`);
  console.log(`  ws://172.16.20.0:${port}`);
  console.log('Make sure to use the correct IP address for your network');
});

export default app;
