import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { log } from './utils/logger';
import compression from 'compression';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import path from 'path';
import { pool } from './db';

const app = express();
const MemoryStoreSession = MemoryStore(session);
const PORT = parseInt(process.env.PORT || '5000', 10);

// Log startup process
console.log('Starting server initialization...');

// Enable compression for all responses
app.use(compression({
  level: 6,
  threshold: 0,
  filter: (req) => {
    const contentType = req.headers['content-type'] || '';
    return !contentType.includes('image/') && !contentType.includes('video/');
  }
}));

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

console.log('Registering routes...');
// Register API routes
const server = registerRoutes(app);

// Setup for development or production
if (process.env.NODE_ENV === 'production') {
  console.log('Running in production mode...');
  // Production: Serve static files
  app.use(express.static(path.join(process.cwd(), 'dist', 'public')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'public', 'index.html'));
  });
} else {
  // Development: Setup Vite middleware
  console.log('Starting in development mode...');
  setupVite(app, server).catch(error => {
    console.error('Vite setup error:', error);
    process.exit(1);
  });
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handler
const shutdown = async () => {
  console.log('Received shutdown signal. Starting graceful shutdown...');

  // Close the HTTP server first
  server.close(() => {
    console.log('HTTP server closed.');
  });

  // Close database pool
  try {
    await pool.end();
    console.log('Database connections closed.');
  } catch (err) {
    console.error('Error closing database connections:', err);
  }

  // Exit process
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server with enhanced logging
console.log(`Attempting to start server on port ${PORT}...`);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is now running at http://0.0.0.0:${PORT}`);
  console.log('Server initialization complete.');
}).on('error', (error: any) => {
  console.error('Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

export default app;