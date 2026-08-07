import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GameManager } from './game/GameManager';
import { setupSocketHandlers } from './sockets/socketHandlers';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize game manager
const gameManager = new GameManager();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup Socket.IO handlers
setupSocketHandlers(io, gameManager);

// Serve Vite-built client in production
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDist));
  // Fallback to index.html for SPA routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🎮 WebSocket server ready for connections`);
});

export { app, httpServer, io, gameManager };
