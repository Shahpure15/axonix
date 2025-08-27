/**
 * Complete Collection Management Script
 * Shows all collection configurations and their current status
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function showCompleteCollectionInfo() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
    
    // Environment Configuration
    console.log('\n🔧 COMPLETE ENVIRONMENT CONFIGURATION:');
    console.log('=' .repeat(60));
    console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
    console.log(`QUESTIONS_COLLECTION: ${process.env.QUESTIONS_COLLECTION || 'questions (default)'}`);
    console.log(`USERS_COLLECTION: ${process.env.USERS_COLLECTION || 'users (default)'}`);
    console.log(`TESTSESSIONS_COLLECTION: ${process.env.TESTSESSIONS_COLLECTION || 'testsessions (default)'}`);
    console.log(`LEARNINGPROGRESS_COLLECTION: ${process.env.LEARNINGPROGRESS_COLLECTION || 'learningprogresses (default)'}`);
    
    // Model Collection Mapping
    console.log('\n🎯 MODEL → COLLECTION MAPPING:');
    console.log('=' .repeat(60));
    const mappings = [
      { model: 'Question', collection: process.env.QUESTIONS_COLLECTION || 'questions' },
      { model: 'User', collection: process.env.USERS_COLLECTION || 'users' },
      { model: 'TestSession', collection: process.env.TESTSESSIONS_COLLECTION || 'testsessions' },
      { model: 'LearningProgress', collection: process.env.LEARNINGPROGRESS_COLLECTION || 'learningprogresses' }
    ];
    
    // List all collections and show document counts
    console.log('\n📚 ALL COLLECTIONS IN DATABASE:');
    console.log('=' .repeat(60));
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   No collections found');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        
        // Check if this collection is being used by our models
        const usedByModel = mappings.find(m => m.collection === collection.name);
        const status = usedByModel ? `✅ Used by ${usedByModel.model} model` : '⚠️  Not configured in models';
        
        console.log(`   📦 ${collection.name}: ${count} documents - ${status}`);
      }
    }
    
    // Check each model's collection status
    console.log('\n🔍 MODEL COLLECTION STATUS:');
    console.log('=' .repeat(60));
    for (const mapping of mappings) {
      const count = await mongoose.connection.db.collection(mapping.collection).countDocuments();
      const exists = collections.some(c => c.name === mapping.collection);
      
      if (exists && count > 0) {
        console.log(`   ✅ ${mapping.model} → "${mapping.collection}" (${count} documents)`);
      } else if (exists && count === 0) {
        console.log(`   🟡 ${mapping.model} → "${mapping.collection}" (empty collection)`);
      } else {
        console.log(`   ❌ ${mapping.model} → "${mapping.collection}" (collection doesn't exist)`);
      }
    }
    
    // Legacy collections check
    console.log('\n🗂️  LEGACY COLLECTIONS CHECK:');
    console.log('=' .repeat(60));
    const legacyCollections = collections.filter(c => 
      !mappings.some(m => m.collection === c.name)
    );
    
    if (legacyCollections.length === 0) {
      console.log('   ✅ No legacy collections found');
    } else {
      console.log('   ⚠️  Found collections not configured in models:');
      for (const legacy of legacyCollections) {
        const count = await mongoose.connection.db.collection(legacy.name).countDocuments();
        console.log(`      📦 ${legacy.name}: ${count} documents`);
      }
    }
    
    // Usage instructions
    console.log('\n📖 USAGE INSTRUCTIONS:');
    console.log('=' .repeat(40));
    console.log('   1. All models now use environment variables for collection names');
    console.log('   2. To change a collection, update the corresponding variable in .env');
    console.log('   3. Current active collections:');
    console.log(`      • Questions: "${process.env.QUESTIONS_COLLECTION || 'questions'}"`);
    console.log(`      • Users: "${process.env.USERS_COLLECTION || 'users'}"`);
    console.log(`      • TestSessions: "${process.env.TESTSESSIONS_COLLECTION || 'testsessions'}"`);
    console.log(`      • LearningProgress: "${process.env.LEARNINGPROGRESS_COLLECTION || 'learningprogresses'}"`);
    
    console.log('\n🎉 Collection configuration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking collections:', error);
    process.exit(1);
  }
}

showCompleteCollectionInfo();
