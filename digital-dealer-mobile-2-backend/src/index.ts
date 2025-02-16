import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupWebSocketServer } from './websocket';
import routes from './routes';

const app = express();
const server = createServer(app);

// Set up CORS with WebSocket support
app.use(cors({
  origin: [
    'https://digital-dealer-mobile-2-website.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  credentials: true
}));

app.use(express.json());
app.use('/api', routes);

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}/websocket`);
}); 