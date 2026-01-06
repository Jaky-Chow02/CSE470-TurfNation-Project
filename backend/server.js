const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const searchRoutes = require('./routes/searchRoutes');


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TurfNation API is running! 🏟️',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      turfs: '/api/turfs',
      bookings: '/api/bookings',
      tournaments: '/api/tournaments',
      weather: '/api/weather',
      rewards: '/api/rewards'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes (we'll add these next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/turfs', require('./routes/turfRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/tournaments', require('./routes/tournamentRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/rewards', require('./routes/rewardsRoutes'));
app.use('/api/search', searchRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║                                        ║
║     🏟️  TurfNation API Server 🏟️      ║
║                                        ║
║  Server running on port ${PORT}         ║
║  Environment: ${process.env.NODE_ENV || 'development'}            ║
║  API: http://localhost:${PORT}            ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;