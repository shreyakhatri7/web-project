import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Internship & Job Portal API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Internship & Job Portal API Server                  ║
║                                                           ║
║   Environment: ${config.nodeEnv.padEnd(42)}║
║   Port: ${PORT.toString().padEnd(50)}║
║   URL: http://localhost:${PORT.toString().padEnd(36)}║
║                                                           ║
║   API Health: http://localhost:${PORT}/api/health${' '.repeat(19)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
