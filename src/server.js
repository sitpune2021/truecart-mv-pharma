require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./database/models');
const { logger } = require('./middleware/utils/requestLogger');

const PORT = process.env.PORT || 5000;

// Test database connection
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    logger.info(' Database connection established successfully');
    return true;
  } catch (error) {
    logger.error(' Unable to connect to database:', error);
    return false;
  }
}

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info(` TrueCart API server running on port ${PORT}`);
      logger.info(` Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(` Health check: http://localhost:${PORT}/health`);
      logger.info(` API base URL: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        sequelize.close();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        sequelize.close();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();
