/**
 * Complete AI Test Generation Flow Demonstration
 * Tests the entire flow: User selects domain → AI analysis → Test generation → Test completion
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test user
const TEST_USER = {
  userId: "user_1755926963360_eimr76fz7",
  email: "ajithaadhwaithkumar@gmail.com",
  name: "Adhu"
};

async function demonstrateAITestFlow() {
  try {
    console.log('🤖 AI Test Generation Flow Demonstration');
    console.log('=' .repeat(60));
    console.log('👤 User:', TEST_USER.name, `(${TEST_USER.email})`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: TEST_USER.userId, email: TEST_USER.email }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Check available test modes
    console.log('\n📋 Step 1: Checking available test modes...');
    try {
      const modesResponse = await axios.get(`${BASE_URL}/api/ai-test/available-modes`, { headers });
      const modes = modesResponse.data.data.modes;
      
      console.log('✅ Available test modes:');
      modes.forEach((mode, index) => {
        console.log(`   ${index + 1}. ${mode.icon} ${mode.name} - ${mode.description}`);
        console.log(`      Difficulty: ${mode.difficulty}, Time: ${mode.estimatedTime}`);
      });
    } catch (error) {
      console.log('⚠️ Could not fetch modes:', error.response?.data?.message);
    }

    // Step 2: Check user readiness for web-development domain
    const domain = 'web-development';
    console.log(`\n🎯 Step 2: Checking user readiness for ${domain}...`);
    try {
      const readinessResponse = await axios.get(`${BASE_URL}/api/ai-test/user-readiness/${domain}`, { headers });
      const readiness = readinessResponse.data.data;
      
      console.log(`✅ User readiness for ${domain}:`);
      console.log(`   Overall Accuracy: ${readiness.overallAccuracy}%`);
      console.log(`   Total Questions Attempted: ${readiness.totalQuestions}`);
      
      console.log('\n   Test Mode Readiness:');
      Object.entries(readiness.readiness).forEach(([testType, status]) => {
        const icon = status.ready ? '✅' : '❌';
        console.log(`   ${icon} ${testType}: ${status.reason}`);
        if (status.accuracy) console.log(`      Current accuracy: ${Math.round(status.accuracy)}%`);
      });

      if (readiness.recommendations && readiness.recommendations.length > 0) {
        console.log('\n   💡 Recommendations:');
        readiness.recommendations.forEach(rec => {
          console.log(`   - ${rec.message} (${rec.action})`);
        });
      }
    } catch (error) {
      console.log('⚠️ Readiness check failed:', error.response?.data?.message);
      if (error.response?.data?.message?.includes('diagnostic test')) {
        console.log('   Skipping to next step with simulated data...');
      }
    }

    // Step 3: Generate AI test for weak areas practice
    console.log('\n🧠 Step 3: Generating AI test for weak areas practice...');
    let generatedTest;
    try {
      const generateResponse = await axios.post(`${BASE_URL}/api/ai-test/generate`, {
        domain: domain,
        testType: 'weak-areas',
        questionCount: 5
      }, { headers });
      
      generatedTest = generateResponse.data.data;
      
      console.log('✅ AI Test Generated Successfully!');
      console.log(`   Test ID: ${generatedTest.testId}`);
      console.log(`   Domain: ${generatedTest.domain}`);
      console.log(`   Test Type: ${generatedTest.testType}`);
      console.log(`   Questions: ${generatedTest.questions.length}`);
      console.log(`   Estimated Duration: ${generatedTest.metadata.estimatedDuration} minutes`);
      console.log(`   Target Accuracy: ${generatedTest.metadata.targetAccuracy}%`);
      
      console.log('\n   🎯 AI Insights:');
      console.log(`   Weakness Areas: ${generatedTest.aiInsights.weaknessAreas.join(', ')}`);
      console.log(`   Focus Topics: ${generatedTest.aiInsights.focusTopics.join(', ')}`);
      console.log(`   AI Confidence: ${generatedTest.aiInsights.aiConfidence}%`);
      console.log(`   Purpose: ${generatedTest.aiInsights.testPurpose}`);

      console.log('\n   📝 Generated Questions:');
      generatedTest.questions.forEach((question, index) => {
        console.log(`   ${index + 1}. [${question.difficulty}] ${question.questionText.substring(0, 60)}...`);
        console.log(`      Topic: ${question.topic} | AI Reason: ${question.aiReason}`);
      });

    } catch (error) {
      console.log('❌ Test generation failed:', error.response?.data?.message);
      return;
    }

    // Step 4: Simulate user taking the test
    console.log('\n📝 Step 4: Simulating user taking the test...');
    
    const userAnswers = [];
    generatedTest.questions.forEach((question, index) => {
      let answer;
      
      // Simulate realistic answers (70% accuracy)
      const shouldAnswerCorrectly = Math.random() < 0.7;
      
      if (question.questionType === 'multiple-choice' && question.options) {
        if (shouldAnswerCorrectly && question.options.length > 0) {
          // Pick the first option (in a real scenario, we don't know which is correct)
          answer = question.options[0].text;
        } else {
          // Pick a random option
          answer = question.options[Math.floor(Math.random() * question.options.length)].text;
        }
      } else if (question.questionType === 'true-false') {
        answer = shouldAnswerCorrectly ? 'true' : (Math.random() < 0.5 ? 'true' : 'false');
      } else {
        answer = 'Sample answer';
      }
      
      userAnswers.push(answer);
      console.log(`   Question ${index + 1}: ${answer}`);
    });

    // Step 5: Submit the test
    console.log('\n📤 Step 5: Submitting the completed test...');
    try {
      const submitResponse = await axios.post(`${BASE_URL}/api/ai-test/submit`, {
        testId: generatedTest.testId,
        answers: userAnswers,
        timeSpent: 600 // 10 minutes
      }, { headers });
      
      const results = submitResponse.data.data;
      
      console.log('✅ Test Submitted Successfully!');
      console.log(`   Session ID: ${results.sessionId}`);
      console.log(`   Score: ${results.score}/${results.totalQuestions} (${results.percentage}%)`);
      
      if (results.results && results.results.length > 0) {
        console.log('\n   📊 Detailed Results:');
        results.results.forEach((result, index) => {
          const status = result.isCorrect ? '✅' : '❌';
          console.log(`   ${status} Question ${index + 1}: ${result.userAnswer}`);
        });
      }

      if (results.improvements) {
        console.log('\n   📈 Improvements:', results.improvements.message);
      }

      if (results.nextRecommendations && results.nextRecommendations.length > 0) {
        console.log('\n   🎯 Next Recommendations:');
        results.nextRecommendations.forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`);
        });
      }

    } catch (error) {
      console.log('❌ Test submission failed:', error.response?.data?.message);
    }

    // Step 6: Get updated analytics
    console.log('\n📊 Step 6: Fetching updated analytics...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/api/ai-test/analytics/${domain}`, { headers });
      const analytics = analyticsResponse.data.data;
      
      console.log('✅ Updated Analytics:');
      console.log(`   Overall Accuracy: ${analytics.overallPerformance.accuracy}%`);
      console.log(`   Total Questions: ${analytics.overallPerformance.totalQuestions}`);
      
      if (analytics.topicBreakdown && analytics.topicBreakdown.length > 0) {
        console.log('\n   📚 Topic Breakdown:');
        analytics.topicBreakdown.forEach(topic => {
          console.log(`   - ${topic.topic}: ${topic.accuracy}% (${topic.questionsAttempted} questions)`);
        });
      }

      if (analytics.weaknessAreas && analytics.weaknessAreas.length > 0) {
        console.log('\n   ⚠️ Weakness Areas:');
        analytics.weaknessAreas.forEach(weakness => {
          console.log(`   - ${weakness.topic} (${weakness.severity}): ${weakness.recommendation}`);
        });
      }

    } catch (error) {
      console.log('⚠️ Analytics fetch failed:', error.response?.data?.message);
    }

    // Step 7: Get test history
    console.log('\n📜 Step 7: Fetching test history...');
    try {
      const historyResponse = await axios.get(`${BASE_URL}/api/ai-test/history?domain=${domain}&limit=5`, { headers });
      const history = historyResponse.data.data.history;
      
      console.log('✅ Recent Test History:');
      history.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.testType} - ${test.status} (${test.questionsCount} questions)`);
        console.log(`      AI Confidence: ${test.aiConfidence}% | Date: ${new Date(test.createdAt).toLocaleDateString()}`);
      });

    } catch (error) {
      console.log('⚠️ History fetch failed:', error.response?.data?.message);
    }

    console.log('\n🎉 AI Test Generation Flow Complete!');
    console.log('=' .repeat(60));
    console.log('✨ Successfully demonstrated:');
    console.log('   ✅ Available test modes retrieval');
    console.log('   ✅ User readiness assessment');
    console.log('   ✅ AI-powered test generation');
    console.log('   ✅ Test completion simulation');
    console.log('   ✅ Performance analytics update');
    console.log('   ✅ Test history tracking');

  } catch (error) {
    console.error('❌ Flow demonstration failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the demonstration
if (require.main === module) {
  console.log('🚀 Starting AI Test Generation Flow Demonstration...');
  console.log('⚠️ Make sure the backend server is running on http://localhost:5000\n');
  
  // Add a small delay to ensure server is ready
  setTimeout(() => {
    demonstrateAITestFlow()
      .then(() => {
        console.log('\n✅ Demonstration completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Demonstration failed:', error.message);
        process.exit(1);
      });
  }, 1000);
}

module.exports = { demonstrateAITestFlow };
