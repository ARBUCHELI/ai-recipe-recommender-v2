import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';
import userRoutes from './routes/users';
import ingredientRoutes from './routes/ingredients';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow frontend to access backend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  process.env.FRONTEND_URL || 'http://localhost:5173'
];

// Add production URLs if in production
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(
    'https://nutriagent-ai-frontend.onrender.com',
    'https://nutriagent-ai.onrender.com'
  );
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Logging
app.use(morgan('combined'));

// Request debugging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
  });
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images and avatars)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Recipe Recommender API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Additional health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'nutriagent-ai-backend',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Recipe Recommender API server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('?')[0]}`);
  console.log(`📂 Uploads directory: ${path.join(__dirname, '../uploads')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});

export default app;