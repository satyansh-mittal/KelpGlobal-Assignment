const fs = require('fs').promises;

class CSVParser {
  /**
   * Custom CSV parser that converts CSV to JSON objects
   * @param {string} csvContent - Raw CSV content as string
   * @returns {Array} Array of JSON objects
   */
  async parseCSV(csvContent) {
    try {
      // Split content into lines and remove empty lines
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV must have at least header and one data row');
      }

      // Parse header row
      const headers = this.parseCSVLine(lines[0]);
      
      // Validate mandatory fields
      this.validateMandatoryFields(headers);
      
      const jsonData = [];
      
      // Process each data row
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        
        if (values.length !== headers.length) {
          console.warn(`Skipping row ${i + 1}: Column count mismatch`);
          continue;
        }
        
        const jsonObject = this.createNestedObject(headers, values);
        jsonData.push(jsonObject);
      }
      
      return jsonData;
    } catch (error) {
      console.error('Error parsing CSV:', error.message);
      throw error;
    }
  }

  /**
   * Parse a single CSV line, handling commas within quoted strings
   * @param {string} line - CSV line to parse
   * @returns {Array} Array of values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    values.push(current.trim());
    
    return values;
  }

  /**
   * Validate that mandatory fields are present
   * @param {Array} headers - Array of header names
   */
  validateMandatoryFields(headers) {
    const mandatoryFields = ['name.firstName', 'name.lastName', 'age'];
    const missingFields = mandatoryFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing mandatory fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Create nested object from dot-separated keys and values
   * @param {Array} headers - Array of header names (dot-separated)
   * @param {Array} values - Array of corresponding values
   * @returns {Object} Nested JSON object
   */
  createNestedObject(headers, values) {
    const result = {};
    
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i].trim();
      const value = values[i].trim();
      
      if (key && value) {
        this.setNestedProperty(result, key, value);
      }
    }
    
    return result;
  }

  /**
   * Set nested property using dot notation
   * @param {Object} obj - Target object
   * @param {string} path - Dot-separated path (e.g., 'name.firstName')
   * @param {string} value - Value to set
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the final value
    const finalKey = keys[keys.length - 1];
    current[finalKey] = this.parseValue(value);
  }

  /**
   * Parse value to appropriate type (number, boolean, or string)
   * @param {string} value - String value to parse
   * @returns {*} Parsed value
   */
  parseValue(value) {
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Try to parse as number
    if (!isNaN(value) && !isNaN(parseFloat(value))) {
      return parseInt(value) == value ? parseInt(value) : parseFloat(value);
    }
    
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Return as string
    return value;
  }

  /**
   * Read and parse CSV file from given path
   * @param {string} filePath - Path to CSV file
   * @returns {Array} Array of JSON objects
   */
  async parseCSVFile(filePath) {
    try {
      const csvContent = await fs.readFile(filePath, 'utf-8');
      return await this.parseCSV(csvContent);
    } catch (error) {
      console.error('Error reading CSV file:', error.message);
      throw error;
    }
  }
}

module.exports = new CSVParser();
