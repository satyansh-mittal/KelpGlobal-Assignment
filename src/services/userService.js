const database = require('../config/database');

class UserService {
  /**
   * Transform JSON data to database format
   * @param {Array} jsonData - Array of JSON objects from CSV
   * @returns {Array} Array of user objects ready for database insertion
   */
  transformUserData(jsonData) {
    return jsonData.map(record => {
      // Extract mandatory fields
      const firstName = record.name?.firstName || '';
      const lastName = record.name?.lastName || '';
      const name = `${firstName} ${lastName}`.trim();
      const age = record.age || 0;

      // Extract address object if present
      const address = record.address || null;

      // Create additional_info object with remaining properties
      const additional_info = {};
      Object.keys(record).forEach(key => {
        if (key !== 'name' && key !== 'age' && key !== 'address') {
          additional_info[key] = record[key];
        }
      });

      return {
        name,
        age: parseInt(age),
        address,
        additional_info: Object.keys(additional_info).length > 0 ? additional_info : null
      };
    });
  }

  /**
   * Bulk insert users into database
   * @param {Array} userData - Array of user objects
   * @returns {Object} Result summary
   */
  async bulkInsertUsers(userData) {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const user of userData) {
      try {
        await database.insertUser(user);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          user: user.name,
          error: error.message
        });
      }
    }

    return {
      total: userData.length,
      success: successCount,
      errors: errorCount,
      errorDetails: errors
    };
  }

  /**
   * Calculate age distribution and print report
   */
  async calculateAgeDistribution() {
    try {
      const users = await database.getAllUsers();
      
      if (users.length === 0) {
        console.log('No users found in database');
        return;
      }

      const ageGroups = {
        'under20': 0,
        '20to40': 0,
        '40to60': 0,
        'over60': 0
      };

      // Count users in each age group
      users.forEach(user => {
        const age = user.age;
        if (age < 20) {
          ageGroups.under20++;
        } else if (age >= 20 && age < 40) {
          ageGroups['20to40']++;
        } else if (age >= 40 && age < 60) {
          ageGroups['40to60']++;
        } else {
          ageGroups.over60++;
        }
      });

      // Calculate percentages
      const total = users.length;
      const distribution = {
        'under20': Math.round((ageGroups.under20 / total) * 100),
        '20to40': Math.round((ageGroups['20to40'] / total) * 100),
        '40to60': Math.round((ageGroups['40to60'] / total) * 100),
        'over60': Math.round((ageGroups.over60 / total) * 100)
      };

      // Print report
      console.log('\n=================================');
      console.log('         AGE DISTRIBUTION REPORT');
      console.log('=================================');
      console.log(`Total Users: ${total}`);
      console.log('---------------------------------');
      console.log('Age-Group       % Distribution');
      console.log('---------------------------------');
      console.log(`< 20            ${distribution.under20}%`);
      console.log(`20 to 40        ${distribution['20to40']}%`);
      console.log(`40 to 60        ${distribution['40to60']}%`);
      console.log(`> 60            ${distribution.over60}%`);
      console.log('=================================\n');

      return distribution;
    } catch (error) {
      console.error('Error calculating age distribution:', error.message);
      throw error;
    }
  }

  /**
   * Process complete CSV workflow
   * @param {Array} jsonData - Parsed JSON data from CSV
   */
  async processCSVData(jsonData) {
    try {
      console.log(`Processing ${jsonData.length} records...`);
      
      // Transform data for database
      const userData = this.transformUserData(jsonData);
      
      // Clear existing data (optional - comment out if you want to append)
      await database.clearUsers();
      
      // Insert users
      const result = await this.bulkInsertUsers(userData);
      
      console.log('\n=== INSERT SUMMARY ===');
      console.log(`Total records: ${result.total}`);
      console.log(`Successfully inserted: ${result.success}`);
      console.log(`Errors: ${result.errors}`);
      
      if (result.errors > 0) {
        console.log('\nError details:');
        result.errorDetails.forEach(error => {
          console.log(`- ${error.user}: ${error.error}`);
        });
      }
      
      // Calculate and print age distribution
      await this.calculateAgeDistribution();
      
      return result;
    } catch (error) {
      console.error('Error processing CSV data:', error.message);
      throw error;
    }
  }
}

module.exports = new UserService();
