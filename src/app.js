const express = require('express');
require('dotenv').config();

const database = require('./config/database');
const csvRoutes = require('./routes/csvRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', csvRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CSV to JSON API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CSV to JSON Convertor API',
    version: '1.0.0',
    endpoints: {
      'POST /api/upload-csv': 'Upload CSV file for processing',
      'POST /api/process-file': 'Process CSV file from configured location',
      'GET /api/users': 'Get all users',
      'GET /api/age-distribution': 'Get age distribution report',
      'DELETE /api/users': 'Clear all users',
      'GET /health': 'Health check'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📖 API Documentation: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`\n📝 Available Endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/upload-csv`);
      console.log(`   POST http://localhost:${PORT}/api/process-file`);
      console.log(`   GET  http://localhost:${PORT}/api/users`);
      console.log(`   GET  http://localhost:${PORT}/api/age-distribution`);
      console.log(`   DELETE http://localhost:${PORT}/api/users`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Graceful shutdown...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
  await database.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
