import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import userRoutes from './src/routes/userRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Security and logging
app.use(helmet());
app.use(morgan('dev'));

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',                  // Local development
  'http://localhost:3001',                  // Alternative local port
  'https://cipherschools-react.vercel.app', // Existing Vercel deployment
  'https://cipherschools-react-o3qh90ync-madira-mahanandi-reddys-projects.vercel.app' // Your specific Vercel deployment
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman or server-to-server requests)
    if (!origin) return callback(null, true);

    // Allow all Vercel deployments (*.vercel.app)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Check against allowed origins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // For development, also allow localhost with any port
    if (origin.includes('localhost')) {
      return callback(null, true);
    }

    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'CipherStudio API is running' });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CipherStudio API running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

export default app;
