import WebSocket from 'ws';
import { Server } from 'http';
import { PrismaClient, Notification } from '@prisma/client';
import { withPulse } from '@prisma/extension-pulse';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

dotenv.config();

const apiKey: string = process.env.PULSE_API_KEY ?? '';
if (!apiKey) {
  console.error('PULSE_API_KEY is required in .env file');
  process.exit(1);
}

const prisma = new PrismaClient().$extends(
  withPulse({ apiKey })
);

const notificationEmitter = new EventEmitter();
let notificationStream: any = null;

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocket.Server({ 
    noServer: true
  });
  console.log('WebSocket server initialized');

  const clients = new Map<WebSocket, { userId?: number }>();
  const processedNotifications = new Set<string>();

  // Initialize Pulse stream once for the server
  const initializePulseStream = async () => {
    if (!notificationStream) {
      notificationStream = await prisma.notification.stream();
      console.log('🚀 Pulse stream initialized');

      // Handle notification events from Pulse
      (async () => {
        for await (const event of notificationStream) {
          const eventId = `${event.id}-${event.action}`;
          
          // Skip if we've already processed this event
          if (processedNotifications.has(eventId)) {
            continue;
          }
          
          console.log('🔔 New Pulse event:', {
            id: event.id,
            action: event.action,
            modelName: event.modelName,
            timestamp: new Date().toISOString()
          });

          processedNotifications.add(eventId);
          // Keep set size manageable
          if (processedNotifications.size > 1000) {
            processedNotifications.clear();
          }

          if ('action' in event && event.action === 'create' && 'record' in event) {
            const notification = event.record as Notification;
            console.log('🔔 Broadcasting notification to relevant clients:', notification);
            
            // Broadcast to all relevant connected clients
            for (const [client, clientData] of clients.entries()) {
              if (clientData.userId === notification.user_id && client.readyState === WebSocket.OPEN) {
                console.log('📬 Sending notification to client:', clientData.userId);
                client.send(JSON.stringify({
                  type: 'notification',
                  notification,
                  userId: notification.user_id
                }));
              }
            }
          }
        }
      })();
    }
  };

  // Initialize Pulse stream on server start
  initializePulseStream();

  // Handle upgrade requests at the server level
  server.on('upgrade', (request, socket, head) => {
    console.log('Upgrade request received for URL:', request.url);
    
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('WebSocket connection upgraded successfully');
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', async function connection(ws: WebSocket, request: any) {
    console.log('New WebSocket connection established');
    clients.set(ws, {});
    let isAlive = true;

    // Send a welcome message
    ws.send(JSON.stringify({ type: 'connected' }));

    const ping = () => {
      if (!isAlive) {
        clients.delete(ws);
        console.log('Client terminated due to inactivity');
        return ws.terminate();
      }
      
      isAlive = false;
      ws.ping();
    };

    // Set up ping interval
    const pingInterval = setInterval(ping, 30000);

    ws.on('pong', () => {
      isAlive = true;
    });

    ws.on('message', async function message(data: string) {
      try {
        const parsedData = JSON.parse(data.toString());
        
        if (parsedData.type === 'init' && parsedData.userId) {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.userId = parsedData.userId;
            clients.set(ws, clientData);
            console.log(`Client registered with userId: ${parsedData.userId}`);
            ws.send(JSON.stringify({ type: 'initialized', userId: parsedData.userId }));
          }
        }
        
        // Handle notifications being marked as read
        if (parsedData.type === 'notifications_read') {
          // Broadcast to all clients for this user to update their UI
          const clientData = clients.get(ws);
          if (clientData?.userId) {
            for (const [client, data] of clients.entries()) {
              if (data.userId === clientData.userId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                  type: 'notifications_updated',
                  hasUnread: false
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
    });

    ws.on('close', function close() {
      clearInterval(pingInterval);
      clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  // Listen for new notifications from other parts of the application
  notificationEmitter.on('newNotification', (notification: Notification) => {
    const userId = notification.user_id;
    const message = JSON.stringify({
      type: 'notification',
      notification
    });

    for (const [client, clientData] of clients.entries()) {
      if (clientData.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  return wss;
}

// Function to emit new notification events
export function emitNewNotification(notification: Notification) {
  notificationEmitter.emit('newNotification', notification);
} 