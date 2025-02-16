import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket';
import authRoutes from './routes/auth.routes';
import customerScanRoutes from './routes/customer-scan.routes';
import customerRoutes from './routes/customer.routes';
import commentRoutes from './routes/comment.routes';
import customerLogRoutes from './routes/customer-log.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import dealershipScanRoutes from './routes/dealership-scan.routes';
import qrCodeRoutes from './routes/qr-code.routes';

const app = express();
const server = createServer(app);

// Set up CORS with WebSocket support
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

app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-scans', customerScanRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/customer-logs', customerLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dealership-scans', dealershipScanRoutes);
app.use('/api/qr-codes', qrCodeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.send('Server is running');
});

// Set up WebSocket server
const wss = setupWebSocketServer(server);

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  const url = request.url || '/';
  const pathname = new URL(url, `http://${request.headers.host || 'localhost'}`).pathname;
  console.log('Upgrade request received for path:', pathname);

  // Accept any path for WebSocket connections
  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log('WebSocket connection upgraded successfully');
    wss.emit('connection', ws, request);
  });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}/websocket`);
}); 