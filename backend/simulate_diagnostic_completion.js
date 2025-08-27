/**
 * Script to simulate a user completing a diagnostic test
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Use an existing user from the data
const TEST_USER = {
  userId: "user_1755926963360_eimr76fz7",
  email: "ajithaadhwaithkumar@gmail.com",
  name: "Adhu"
};

// Mock JWT token for the user (in real scenario, this would be obtained through login)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const jwt = require('jsonwebtoken');

async function simulateDiagnosticTest() {
  try {
    console.log('🎯 Starting Diagnostic Test Simulation');
    console.log('👤 User:', TEST_USER.name, `(${TEST_USER.email})`);
    
    // Generate JWT token for the user
    const token = jwt.sign(
      { 
        userId: TEST_USER.userId, 
        email: TEST_USER.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Get available domains
    console.log('\n📋 Step 1: Getting available domains...');
    const domainsResponse = await axios.get(`${BASE_URL}/test/domains`, { headers });
    const domains = domainsResponse.data.data.domains;
    console.log('✅ Available domains:', domains);

    // Step 2: Select a domain for the test (let's use 'web-development')
    const selectedDomain = 'web-development';
    console.log(`\n🎯 Step 2: Starting diagnostic test for domain: ${selectedDomain}`);

    // Step 3: Get diagnostic questions
    const questionsResponse = await axios.get(
      `${BASE_URL}/test/diagnostic/${selectedDomain}?limit=5`, 
      { headers }
    );
    
    const questions = questionsResponse.data.data.questions;
    console.log(`✅ Retrieved ${questions.length} diagnostic questions`);

    // Step 4: Create a test session
    console.log('\n📝 Step 3: Creating test session...');
    const sessionResponse = await axios.post(`${BASE_URL}/test/start`, {
      domain: selectedDomain,
      testType: 'diagnostic',
      questions: questions.map(q => q._id)
    }, { headers });

    const sessionId = sessionResponse.data.data.sessionId;
    console.log('✅ Test session created:', sessionId);

    // Step 5: Simulate user answers (mix of correct and incorrect)
    console.log('\n🤔 Step 4: Simulating user answers...');
    const userAnswers = [];
    
    questions.forEach((question, index) => {
      console.log(`\nQuestion ${index + 1}: ${question.questionText}`);
      
      if (question.questionType === 'multiple-choice') {
        // Simulate getting some answers right (70% accuracy)
        const correctOption = question.options.find(opt => opt.isCorrect);
        const randomChance = Math.random();
        
        if (randomChance < 0.7 && correctOption) {
          // Answer correctly
          userAnswers.push(correctOption.text);
          console.log(`✅ User answered: ${correctOption.text} (CORRECT)`);
        } else {
          // Answer incorrectly - pick a random wrong answer
          const wrongOptions = question.options.filter(opt => !opt.isCorrect);
          const wrongAnswer = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
          userAnswers.push(wrongAnswer.text);
          console.log(`❌ User answered: ${wrongAnswer.text} (INCORRECT)`);
        }
      } else if (question.questionType === 'true-false') {
        // Simulate 70% accuracy for true/false questions
        const randomChance = Math.random();
        if (randomChance < 0.7) {
          userAnswers.push(question.correctAnswer);
          console.log(`✅ User answered: ${question.correctAnswer} (CORRECT)`);
        } else {
          const wrongAnswer = question.correctAnswer === 'true' ? 'false' : 'true';
          userAnswers.push(wrongAnswer);
          console.log(`❌ User answered: ${wrongAnswer} (INCORRECT)`);
        }
      }
    });

    // Step 6: Submit the test
    console.log('\n📤 Step 5: Submitting test answers...');
    const submitResponse = await axios.post(`${BASE_URL}/test/submit`, {
      sessionId: sessionId,
      answers: userAnswers
    }, { headers });

    const results = submitResponse.data.data;
    console.log('\n🎉 Test Completed!');
    console.log('📊 Results:');
    console.log(`   Score: ${results.score}/${results.totalQuestions} (${results.percentage.toFixed(1)}%)`);
    console.log(`   Correct Answers: ${results.correctAnswers}`);
    console.log(`   Feedback: ${results.feedback}`);
    
    if (results.recommendations && results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Step 7: Update the diagnostic_tests.json file to mark as completed
    const fs = require('fs').promises;
    const diagnosticTestsPath = '../data/diagnostic_tests.json';
    
    try {
      const diagnosticData = JSON.parse(await fs.readFile(diagnosticTestsPath, 'utf8'));
      
      // Find and update the existing diagnostic test entry
      const existingTestIndex = diagnosticData.diagnostic_tests.findIndex(
        test => test.userId === TEST_USER.userId && test.domainId === selectedDomain
      );

      if (existingTestIndex !== -1) {
        // Update existing entry
        diagnosticData.diagnostic_tests[existingTestIndex].completed = true;
        diagnosticData.diagnostic_tests[existingTestIndex].score = results.percentage;
        diagnosticData.diagnostic_tests[existingTestIndex].completedAt = new Date().toISOString();
      } else {
        // Add new entry
        diagnosticData.diagnostic_tests.push({
          userId: TEST_USER.userId,
          email: TEST_USER.email,
          domainId: selectedDomain,
          domainName: getDomainDisplayName(selectedDomain),
          completed: true,
          startedAt: new Date().toISOString(),
          score: results.percentage,
          completedAt: new Date().toISOString()
        });
      }

      await fs.writeFile(diagnosticTestsPath, JSON.stringify(diagnosticData, null, 2));
      console.log('\n✅ Updated diagnostic_tests.json file');
      
    } catch (fileError) {
      console.log('\n⚠️  Could not update diagnostic_tests.json:', fileError.message);
    }

    console.log('\n🎯 Diagnostic Test Simulation Complete!');
    return results;

  } catch (error) {
    console.error('❌ Error during simulation:', error.response?.data || error.message);
    throw error;
  }
}

function getDomainDisplayName(domainId) {
  const domainNames = {
    'web-development': 'Web Development',
    'mobile-development': 'Mobile Development',
    'data-science': 'Data Science',
    'machine-learning': 'Machine Learning',
    'devops': 'DevOps',
    'cybersecurity': 'Cybersecurity',
    'blockchain': 'Blockchain',
    'game-development': 'Game Development',
    'ui-ux-design': 'UI/UX Design',
    'cloud-computing': 'Cloud Computing'
  };
  return domainNames[domainId] || domainId;
}

// Run the simulation
if (require.main === module) {
  simulateDiagnosticTest()
    .then(() => {
      console.log('\n✨ Simulation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Simulation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { simulateDiagnosticTest };
