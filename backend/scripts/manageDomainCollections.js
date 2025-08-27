/**
 * Domain Collection Management Script
 * Provides utilities to manage and query domain-specific collections
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getDomainStatistics, getQuestionsByDomain, getDiagnosticQuestions, getAvailableDomains } = require('../models/DomainQuestions');

// Load environment variables
dotenv.config();

async function manageDomainCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);

    // Get comprehensive statistics
    console.log('\n📊 DOMAIN COLLECTION OVERVIEW:');
    console.log('=' .repeat(60));
    
    const stats = await getDomainStatistics();
    let totalQuestions = 0;
    
    Object.entries(stats).forEach(([domain, stat]) => {
      console.log(`\n🔹 ${domain.toUpperCase()}`);
      if (stat.error) {
        console.log(`   ❌ Error: ${stat.error}`);
      } else {
        console.log(`   📦 Collection: ${stat.collection}`);
        console.log(`   📝 Questions: ${stat.totalQuestions}`);
        if (stat.difficulties) {
          console.log(`   📈 Difficulties:`);
          Object.entries(stat.difficulties).forEach(([diff, count]) => {
            console.log(`      ${diff}: ${count}`);
          });
        }
        totalQuestions += stat.totalQuestions;
      }
    });

    console.log(`\n📋 SUMMARY:`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Active Domains: ${Object.keys(stats).filter(d => !stats[d].error).length}`);
    console.log(`   Available Domains: ${getAvailableDomains().join(', ')}`);

    // Test diagnostic question retrieval
    console.log('\n🧪 TESTING DIAGNOSTIC QUESTION RETRIEVAL:');
    console.log('=' .repeat(60));
    
    const testDomains = ['machine-learning', 'web-development', 'data-science'];
    
    for (const domain of testDomains) {
      try {
        console.log(`\n🔬 Testing ${domain}:`);
        const diagnosticQuestions = await getDiagnosticQuestions(domain, 3);
        console.log(`   ✅ Retrieved ${diagnosticQuestions.length} diagnostic questions`);
        
        if (diagnosticQuestions.length > 0) {
          const difficulties = diagnosticQuestions.map(q => q.difficulty);
          console.log(`   📊 Difficulties: ${difficulties.join(', ')}`);
          console.log(`   📝 Sample question: "${diagnosticQuestions[0].questionText.substring(0, 50)}..."`);
        }
      } catch (error) {
        console.log(`   ❌ Error testing ${domain}: ${error.message}`);
      }
    }

    // Environment variable verification
    console.log('\n🔧 ENVIRONMENT VARIABLE VERIFICATION:');
    console.log('=' .repeat(60));
    const envVars = [
      { var: 'QUESTIONS_ML_COLLECTION', value: process.env.QUESTIONS_ML_COLLECTION },
      { var: 'QUESTIONS_DS_COLLECTION', value: process.env.QUESTIONS_DS_COLLECTION },
      { var: 'QUESTIONS_WEB_COLLECTION', value: process.env.QUESTIONS_WEB_COLLECTION },
      { var: 'QUESTIONS_MOBILE_COLLECTION', value: process.env.QUESTIONS_MOBILE_COLLECTION },
      { var: 'QUESTIONS_DEVOPS_COLLECTION', value: process.env.QUESTIONS_DEVOPS_COLLECTION },
      { var: 'QUESTIONS_SECURITY_COLLECTION', value: process.env.QUESTIONS_SECURITY_COLLECTION },
      { var: 'QUESTIONS_UIUX_COLLECTION', value: process.env.QUESTIONS_UIUX_COLLECTION },
      { var: 'QUESTIONS_CLOUD_COLLECTION', value: process.env.QUESTIONS_CLOUD_COLLECTION }
    ];

    envVars.forEach(({ var: varName, value }) => {
      const status = value ? '✅' : '❌';
      console.log(`   ${status} ${varName}: ${value || 'NOT SET'}`);
    });

    // API Usage Examples
    console.log('\n📚 API USAGE EXAMPLES:');
    console.log('=' .repeat(50));
    console.log(`
// Get all questions from a domain
const mlQuestions = await getQuestionsByDomain('machine-learning');

// Get questions by difficulty
const beginnerQuestions = await getQuestionsByDifficulty('web-development', 'beginner', 5);

// Get diagnostic test questions (mixed difficulties)
const diagnosticQuestions = await getDiagnosticQuestions('data-science', 10);

// Get domain statistics
const stats = await getDomainStatistics();
    `);

    console.log('\n✅ Domain collection management complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error managing domain collections:', error);
    process.exit(1);
  }
}

manageDomainCollections();
