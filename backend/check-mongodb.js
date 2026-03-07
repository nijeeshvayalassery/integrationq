#!/usr/bin/env node

/**
 * MongoDB Connection Checker
 * Run this script to verify MongoDB is accessible
 */

const mongoose = require('mongoose');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n`),
};

async function checkMongoDB() {
  log.section('MongoDB Connection Check');

  // Try different connection strings
  const connectionStrings = [
    'mongodb://localhost:27017/integrationiq',
    'mongodb://127.0.0.1:27017/integrationiq',
    'mongodb://admin:password123@localhost:27017/integrationiq?authSource=admin',
  ];

  for (const uri of connectionStrings) {
    log.info(`Trying: ${uri.replace(/password123/, '***')}`);
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });

      log.success('MongoDB connection successful!');
      log.info(`Database: ${mongoose.connection.name}`);
      log.info(`Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
      log.info(`Ready State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

      // Test write operation
      log.info('\nTesting write operation...');
      const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
      await TestModel.create({ name: 'Connection Test' });
      log.success('Write operation successful!');

      // Test read operation
      log.info('Testing read operation...');
      const count = await TestModel.countDocuments();
      log.success(`Read operation successful! Found ${count} test document(s)`);

      // Clean up
      await TestModel.deleteMany({});
      log.info('Cleaned up test data');

      // Show collections
      log.info('\nExisting collections:');
      const collections = await mongoose.connection.db.listCollections().toArray();
      if (collections.length === 0) {
        log.info('No collections yet (database is empty)');
      } else {
        collections.forEach(col => log.info(`  - ${col.name}`));
      }

      await mongoose.connection.close();
      
      log.section('✅ MongoDB is UP and ACCESSIBLE!');
      log.success('Connection String to use in .env:');
      console.log(`\n  MONGODB_URI=${uri}\n`);
      
      process.exit(0);
    } catch (error) {
      log.error(`Failed: ${error.message}`);
      await mongoose.connection.close();
    }
  }

  log.section('❌ MongoDB Connection Failed');
  log.error('Could not connect to MongoDB with any connection string');
  log.warning('\nTroubleshooting steps:');
  console.log('1. Check if Docker containers are running:');
  console.log('   docker ps');
  console.log('\n2. Check Docker logs:');
  console.log('   docker-compose logs mongodb');
  console.log('\n3. Restart Docker containers:');
  console.log('   docker-compose restart');
  console.log('\n4. Check if port 27017 is in use:');
  console.log('   lsof -i :27017');
  console.log('\n5. Try starting Docker Desktop application');
  
  process.exit(1);
}

// Run the check
checkMongoDB().catch((error) => {
  log.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});

// Made with Bob
