/**
 * MongoDB Database Inspector
 * Check what collections and data exist in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function inspectDatabase() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB');
    console.log('📁 Database:', mongoose.connection.name);
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections in database:');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`  - ${collectionName}: ${count} documents`);
      
      // Show sample documents for relevant collections
      if (collectionName.includes('test') || collectionName.includes('session') || collectionName.includes('user') || collectionName.includes('progress')) {
        const sample = await mongoose.connection.db.collection(collectionName).findOne();
        if (sample) {
          console.log(`    Sample document keys: ${Object.keys(sample).join(', ')}`);
        }
      }
    }
    
    // Check for specific diagnostic test data
    console.log('\n🔍 Looking for diagnostic test sessions...');
    
    // Check testsessions collection
    try {
      const testSessions = await mongoose.connection.db.collection('testsessions').find({}).limit(5).toArray();
      if (testSessions.length > 0) {
        console.log(`Found ${testSessions.length} test sessions (showing first 5):`);
        testSessions.forEach((session, index) => {
          console.log(`  ${index + 1}. Type: ${session.testType}, Domain: ${session.domain}, Status: ${session.status}, User: ${session.userId}`);
        });
      } else {
        console.log('No test sessions found in testsessions collection');
      }
    } catch (error) {
      console.log('testsessions collection not found or error:', error.message);
    }
    
    // Check users collection for onboarding completion
    try {
      const users = await mongoose.connection.db.collection('users').find({}).limit(3).toArray();
      if (users.length > 0) {
        console.log(`\n👥 Found ${users.length} users (showing first 3):`);
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. Email: ${user.email}, Onboarding: ${user.onboardingCompleted || 'not set'}`);
          if (user.diagnosticTestCompleted !== undefined) {
            console.log(`      Diagnostic Test: ${user.diagnosticTestCompleted}`);
          }
        });
      }
    } catch (error) {
      console.log('users collection not found or error:', error.message);
    }
    
    // Check learningprogress collection
    try {
      const progress = await mongoose.connection.db.collection('learningprogresses').find({}).limit(3).toArray();
      if (progress.length > 0) {
        console.log(`\n📊 Found ${progress.length} learning progress records:`);
        progress.forEach((prog, index) => {
          console.log(`  ${index + 1}. User: ${prog.userId}, Domains: ${prog.domains?.length || 0}`);
          if (prog.diagnosticTests) {
            console.log(`      Diagnostic Tests: ${Object.keys(prog.diagnosticTests).join(', ')}`);
          }
        });
      }
    } catch (error) {
      console.log('learningprogresses collection not found or error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Connection closed');
  }
}

inspectDatabase();
