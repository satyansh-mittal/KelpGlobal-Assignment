const express = require('express');
const multer = require('multer');
const csvParser = require('../services/csvParser');
const userService = require('../services/userService');
const database = require('../config/database');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

/**
 * POST /api/upload-csv
 * Upload and process CSV file
 */
router.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    // Convert buffer to string
    const csvContent = req.file.buffer.toString('utf-8');
    
    // Parse CSV to JSON
    const jsonData = await csvParser.parseCSV(csvContent);
    
    // Process and insert into database
    const result = await userService.processCSVData(jsonData);
    
    res.json({
      success: true,
      message: 'CSV processed successfully',
      data: {
        totalRecords: result.total,
        successfulInserts: result.success,
        errors: result.errors,
        errorDetails: result.errorDetails
      }
    });
  } catch (error) {
    console.error('Error processing CSV upload:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing CSV file',
      error: error.message
    });
  }
});

/**
 * POST /api/process-file
 * Process CSV file from configured location
 */
router.post('/process-file', async (req, res) => {
  try {
    const csvFilePath = process.env.CSV_FILE_PATH;
    
    if (!csvFilePath) {
      return res.status(400).json({
        success: false,
        message: 'CSV_FILE_PATH not configured in environment variables'
      });
    }

    // Parse CSV file
    const jsonData = await csvParser.parseCSVFile(csvFilePath);
    
    // Process and insert into database
    const result = await userService.processCSVData(jsonData);
    
    res.json({
      success: true,
      message: 'CSV file processed successfully',
      data: {
        filePath: csvFilePath,
        totalRecords: result.total,
        successfulInserts: result.success,
        errors: result.errors,
        errorDetails: result.errorDetails
      }
    });
  } catch (error) {
    console.error('Error processing CSV file:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing CSV file',
      error: error.message
    });
  }
});

/**
 * GET /api/users
 * Get all users from database
 */
router.get('/users', async (req, res) => {
  try {
    const users = await database.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

/**
 * GET /api/age-distribution
 * Get age distribution report
 */
router.get('/age-distribution', async (req, res) => {
  try {
    const distribution = await userService.calculateAgeDistribution();
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error calculating age distribution:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error calculating age distribution',
      error: error.message
    });
  }
});

/**
 * DELETE /api/users
 * Clear all users from database
 */
router.delete('/users', async (req, res) => {
  try {
    await database.clearUsers();
    res.json({
      success: true,
      message: 'All users cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error clearing users',
      error: error.message
    });
  }
});

module.exports = router;
