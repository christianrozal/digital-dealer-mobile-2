import WebSocket from 'ws';
import { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();
const notificationEmitter = new EventEmitter();

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/websocket'
  });
  console.log('WebSocket server initialized at /websocket');

  const clients = new Map<WebSocket, number>();

  wss.on('connection', function connection(ws: WebSocket) {
    console.log('New WebSocket connection established');

    // Send a welcome message
    ws.send(JSON.stringify({ type: 'connected' }));

    ws.on('message', async function message(data: string) {
      try {
        console.log('Received message:', data.toString());
        const parsedData = JSON.parse(data.toString());
        
        if (parsedData.type === 'init' && parsedData.userId) {
          clients.set(ws, parsedData.userId);
          console.log(`Client registered with userId: ${parsedData.userId}`);
          // Send confirmation
          ws.send(JSON.stringify({ type: 'initialized', userId: parsedData.userId }));
        }

        if (parsedData.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('error', function error(err) {
      console.error('WebSocket error:', err);
    });

    ws.on('close', function close() {
      clients.delete(ws);
      console.log('Client disconnected');
    });
  });

  // Listen for new notifications
  notificationEmitter.on('newNotification', (notification: any) => {
    const userId = notification.user_id;
    const message = JSON.stringify({
      type: 'notification',
      userId,
      notification
    });

    [...clients.entries()]
      .filter(([_, clientUserId]) => clientUserId === userId)
      .forEach(([client]) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
  });

  return wss;
}

// Function to emit new notification events
export function emitNewNotification(notification: any) {
  notificationEmitter.emit('newNotification', notification);
} 