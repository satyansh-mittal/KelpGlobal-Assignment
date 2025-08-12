# CSV to JSON Convertor API

A Node.js Express API that converts CSV files to JSON format and stores user data in a MySQL database with age distribution analysis.

## Features

- **Custom CSV Parser**: Built from scratch without using external CSV parsing libraries
- **Nested Object Support**: Handles complex properties with dot notation (e.g., `name.firstName`, `address.city`)
- **MySQL Integration**: Stores data in MySQL database with proper schema
- **Age Distribution Analysis**: Automatically calculates and displays age group statistics
- **File Upload Support**: Accepts CSV files via API endpoints
- **Error Handling**: Comprehensive error handling and validation
- **Production Ready**: Clean code structure and proper logging

## Project Structure

```
├── src/
│   ├── app.js                 # Main application entry point
│   ├── config/
│   │   └── database.js        # MySQL database configuration
│   ├── services/
│   │   ├── csvParser.js       # Custom CSV parsing logic
│   │   └── userService.js     # User data processing service
│   └── routes/
│       └── csvRoutes.js       # API routes
├── data/
│   └── users.csv              # Sample CSV file
├── .env                       # Environment configuration
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn package manager

## Installation

1. **Clone or download the project**
   ```bash
   cd "Kelp Global Assignment"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   - Create a new database in MySQL:
   ```sql
   CREATE DATABASE kelp_assignment;
   ```

4. **Configure environment variables**
   - Edit the `.env` file with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=kelp_assignment
   DB_PORT=3306
   CSV_FILE_PATH=./data/users.csv
   PORT=3000
   ```

## Usage

### Starting the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### API Endpoints

#### 1. Upload CSV File
- **URL**: `POST /api/upload-csv`
- **Description**: Upload a CSV file for processing
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `csvFile` field

**Example using curl:**
```bash
curl -X POST -F "csvFile=@data/users.csv" http://localhost:3000/api/upload-csv
```

#### 2. Process File from Configuration
- **URL**: `POST /api/process-file`
- **Description**: Process CSV file from the configured path (CSV_FILE_PATH in .env)

**Example:**
```bash
curl -X POST http://localhost:3000/api/process-file
```

#### 3. Get All Users
- **URL**: `GET /api/users`
- **Description**: Retrieve all users from the database

#### 4. Get Age Distribution
- **URL**: `GET /api/age-distribution`
- **Description**: Get age distribution report

#### 5. Clear Users
- **URL**: `DELETE /api/users`
- **Description**: Remove all users from the database

#### 6. Health Check
- **URL**: `GET /health`
- **Description**: Check API health status

### CSV Format Requirements

The CSV file must include these mandatory fields:
- `name.firstName`
- `name.lastName`
- `age`

**Example CSV:**
```csv
name.firstName,name.lastName,age,address.line1,address.city,gender
Rohit,Prasad,35,A-563 Rakshak Society,Pune,male
Priya,Sharma,28,B-101 Green Valley,Mumbai,female
```

### Database Schema

The application creates a `users` table with the following structure:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,          -- firstName + lastName
  age INT NOT NULL,
  address JSON,                        -- Address object from CSV
  additional_info JSON                 -- Other properties from CSV
);
```

## Sample Output

When processing CSV data, the application will:

1. Parse the CSV file
2. Insert records into the MySQL database
3. Display an insertion summary
4. Generate and print an age distribution report:

```
=================================
         AGE DISTRIBUTION REPORT
=================================
Total Users: 20
---------------------------------
Age-Group       % Distribution
---------------------------------
< 20            10%
20 to 40        45%
40 to 60        35%
> 60            10%
=================================
```

## Key Features Implemented

### 1. Custom CSV Parser
- Handles quoted strings with commas
- Supports nested object creation using dot notation
- Validates mandatory fields
- Processes large files efficiently (tested with 50,000+ records)

### 2. Data Transformation
- Combines `firstName` and `lastName` into a single `name` field
- Separates `address` object from other properties
- Stores additional properties in `additional_info` JSON field

### 3. Error Handling
- Comprehensive validation
- Detailed error reporting
- Graceful handling of malformed data

### 4. Performance Considerations
- Bulk insert operations
- Efficient memory usage
- Proper connection management

## Testing

You can test the API using the provided sample CSV file:

```bash
# Process the sample file
curl -X POST http://localhost:3000/api/process-file

# Check the results
curl http://localhost:3000/api/users
curl http://localhost:3000/api/age-distribution
```

## Assumptions Made

1. **Data Types**: Numeric values in CSV are automatically converted to integers/floats
2. **Name Concatenation**: First name and last name are joined with a space
3. **Missing Values**: Empty or missing values are handled gracefully
4. **File Size**: Maximum upload size is set to 50MB
5. **Database Cleanup**: The `process-file` endpoint clears existing data before inserting new records
6. **Character Encoding**: CSV files are expected to be UTF-8 encoded

## Development Notes

- The CSV parser is built from scratch as per requirements
- Uses MySQL instead of PostgreSQL as requested
- Includes comprehensive error handling and logging
- Production-ready code structure with proper separation of concerns
- Environment-based configuration for flexibility

## License

This project is created for the Kelp Global coding challenge.
