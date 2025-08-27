/**
 * Collection Info Script
 * Shows which collections are being used based on environment variables
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function showCollectionInfo() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
    
    // Show environment configuration
    console.log('\n🔧 ENVIRONMENT CONFIGURATION:');
    console.log('=' .repeat(50));
    console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
    console.log(`QUESTIONS_COLLECTION: ${process.env.QUESTIONS_COLLECTION || 'questions (default)'}`);
    
    // List all collections in the database
    console.log('\n📚 ALL COLLECTIONS IN DATABASE:');
    console.log('=' .repeat(50));
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   No collections found');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`   📦 ${collection.name}: ${count} documents`);
      }
    }
    
    // Show which collection our Question model will use
    console.log('\n🎯 QUESTION MODEL CONFIGURATION:');
    console.log('=' .repeat(50));
    const questionsCollectionName = process.env.QUESTIONS_COLLECTION || 'questions';
    console.log(`   Question model will use collection: "${questionsCollectionName}"`);
    
    // Check if the questions collection exists and has data
    const questionCount = await mongoose.connection.db.collection(questionsCollectionName).countDocuments();
    console.log(`   Documents in "${questionsCollectionName}": ${questionCount}`);
    
    if (questionCount > 0) {
      console.log(`   ✅ Questions collection is properly configured and populated`);
    } else {
      console.log(`   ⚠️  Questions collection "${questionsCollectionName}" is empty or doesn't exist`);
    }
    
    console.log('\n🔄 USAGE:');
    console.log('=' .repeat(30));
    console.log('   • All Question model operations will use the collection specified in QUESTIONS_COLLECTION');
    console.log('   • To change the collection, update QUESTIONS_COLLECTION in .env file');
    console.log('   • Default collection name is "questions" if not specified');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    process.exit(1);
  }
}

showCollectionInfo();
