const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      });
      
      console.log('Connected to MySQL database successfully');
      await this.createTables();
    } catch (error) {
      console.error('Database connection failed:', error.message);
      throw error;
    }
  }

  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        address JSON,
        additional_info JSON
      )
    `;

    try {
      await this.connection.execute(createUsersTable);
      console.log('Users table created or already exists');
    } catch (error) {
      console.error('Error creating tables:', error.message);
      throw error;
    }
  }

  async insertUser(userData) {
    const query = `
      INSERT INTO users (name, age, address, additional_info)
      VALUES (?, ?, ?, ?)
    `;
    
    try {
      const [result] = await this.connection.execute(query, [
        userData.name,
        userData.age,
        userData.address ? JSON.stringify(userData.address) : null,
        userData.additional_info ? JSON.stringify(userData.additional_info) : null
      ]);
      return result;
    } catch (error) {
      console.error('Error inserting user:', error.message);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const [rows] = await this.connection.execute('SELECT * FROM users');
      return rows;
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }

  async clearUsers() {
    try {
      await this.connection.execute('DELETE FROM users');
      console.log('All users cleared from database');
    } catch (error) {
      console.error('Error clearing users:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }
}

module.exports = new Database();
