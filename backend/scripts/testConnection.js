const mongoose = require('mongoose');
const connectDB = require('../db');
const DomainQuestions = require('../models/DomainQuestions');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await connectDB();
    console.log('✅ Connected successfully');
    
    console.log('Testing DomainQuestions model...');
    const model = DomainQuestions.getQuestionModel('machine-learning');
    console.log('✅ Model created successfully for machine-learning');
    
    const count = await model.countDocuments();
    console.log(`Current question count for machine-learning: ${count}`);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testConnection();
