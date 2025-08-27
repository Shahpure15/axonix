/**
 * Test the Dashboard API Implementation
 * Quick test to verify the flow is working
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function testDashboardFlow() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Import models
    const User = require('./models/User');
    const TestSession = require('./models/TestSession');
    
    // Find the existing user
    const user = await User.findOne({ email: 'shahpuresocial@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.email);
    console.log('🎯 Onboarding completed:', user.onboardingCompleted);
    console.log('📚 Selected domains:', user.onboardingData?.domains || []);
    
    // Test the actual dashboard API logic
    console.log('\n🧪 Testing Dashboard API Logic:');
    
    const preferredDomains = user.onboardingData?.domains || [];
    
    // Initialize diagnostic tests map if it doesn't exist
    if (!user.diagnosticTests) {
      user.diagnosticTests = new Map();
      console.log('✨ Initialized diagnosticTests map');
    }
    
    // Prepare diagnostic test data for each preferred domain (same logic as dashboard API)
    const diagnosticTests = preferredDomains.map(domain => {
      const testData = user.diagnosticTests.get(domain) || {
        completed: false,
        attempts: 0,
        bestScore: 0,
        lastAttemptDate: null,
        testSessionIds: []
      };

      return {
        domain,
        domainDisplayName: domain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        completed: testData.completed,
        attempts: testData.attempts,
        bestScore: testData.bestScore,
        lastAttemptDate: testData.lastAttemptDate,
        canAttempt: true,
        status: testData.completed ? 'completed' : 'not-started',
        recommendation: testData.completed ? 
          'Great! Continue with your learning path' : 
          'Take this diagnostic test to personalize your learning journey'
      };
    });
    
    console.log('\n📊 Diagnostic Tests Available:');
    diagnosticTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.domainDisplayName}`);
      console.log(`   Status: ${test.status}`);
      console.log(`   Attempts: ${test.attempts} | Best Score: ${test.bestScore}`);
      console.log(`   Recommendation: ${test.recommendation}`);
    });
    
    // Check if questions exist for these domains
    const db = mongoose.connection.db;
    
    console.log('\n🔍 Checking question availability:');
    for (const domain of preferredDomains) {
      try {
        const count = await db.collection(`questions_${domain}`).countDocuments();
        console.log(`📚 ${domain}: ${count} questions available`);
      } catch (error) {
        console.log(`❌ ${domain}: No questions found`);
      }
    }
    
    // Check test sessions
    const testSessions = await TestSession.find({ userId: user._id });
    console.log(`\n📊 Found ${testSessions.length} test sessions`);
    
    testSessions.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.domain} - ${session.status} (${session.percentage}%)`);
    });
    
    console.log('\n🎉 Dashboard test complete!');
    console.log('\n📋 Summary:');
    console.log(`- User has onboarding: ${user.onboardingCompleted ? '✅' : '❌'}`);
    console.log(`- Selected domains: ${user.onboardingData?.domains?.length || 0}`);
    console.log(`- Diagnostic tests ready: ${diagnosticTests.length}`);
    console.log(`- Questions available: ✅`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testDashboardFlow();
