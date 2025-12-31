require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { requestLogger } = require('./middleware/utils/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/utils/errorHandler');
const { apiLimiter } = require('./middleware/security/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth/auth.routes');
const customerAuthRoutes = require('./routes/customer/customerAuth.routes');
const adminRoutes = require('./routes/admin/admin.routes');
const vendorRoutes = require('./routes/vendor/vendor.routes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Static file serving for uploads
const uploadsDir = process.env.UPLOAD_PATH
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Rate limiting (apply to all routes)
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TrueCart API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/customer', customerAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
