/**
 * Simple script to simulate diagnostic test completion by directly updating data files
 */

const fs = require('fs').promises;
const path = require('path');

// Use an existing user from the data
const TEST_USER = {
  userId: "user_1755926963360_eimr76fz7",
  email: "ajithaadhwaithkumar@gmail.com",
  name: "Adhu"
};

async function simulateDiagnosticTestCompletion() {
  try {
    console.log('🎯 Starting Diagnostic Test Simulation (Direct Data Update)');
    console.log('👤 User:', TEST_USER.name, `(${TEST_USER.email})`);
    
    // Simulate test completion for web-development domain
    const selectedDomain = 'web-development';
    const domainName = 'Web Development';
    
    // Simulate answers and score (75% - good performance)
    const simulatedResults = {
      totalQuestions: 10,
      correctAnswers: 7,
      score: 75,
      answers: [
        { question: "What is HTML?", userAnswer: "HyperText Markup Language", correct: true },
        { question: "Which CSS property is used for background color?", userAnswer: "background-color", correct: true },
        { question: "What does JS stand for?", userAnswer: "JavaScript", correct: true },
        { question: "Which HTML tag is used for the largest heading?", userAnswer: "<h1>", correct: true },
        { question: "What is the correct CSS syntax?", userAnswer: "body {color: black;}", correct: true },
        { question: "How do you create a function in JavaScript?", userAnswer: "function myFunction() {}", correct: true },
        { question: "Which HTTP method is used to send data?", userAnswer: "GET", correct: false }, // Should be POST
        { question: "What is the latest version of HTML?", userAnswer: "HTML4", correct: false }, // Should be HTML5
        { question: "Which is not a JavaScript data type?", userAnswer: "string", correct: false }, // Should be float
        { question: "What does CSS stand for?", userAnswer: "Cascading Style Sheets", correct: true }
      ]
    };

    console.log(`\n📊 Simulated Test Results for ${domainName}:`);
    console.log(`   Total Questions: ${simulatedResults.totalQuestions}`);
    console.log(`   Correct Answers: ${simulatedResults.correctAnswers}`);
    console.log(`   Score: ${simulatedResults.score}%`);
    
    console.log('\n📝 Answer Details:');
    simulatedResults.answers.forEach((answer, index) => {
      const status = answer.correct ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${answer.question.substring(0, 50)}...`);
    });

    // Update diagnostic_tests.json
    console.log('\n📄 Updating diagnostic_tests.json...');
    const diagnosticTestsPath = path.join(__dirname, '..', 'data', 'diagnostic_tests.json');
    
    try {
      const diagnosticData = JSON.parse(await fs.readFile(diagnosticTestsPath, 'utf8'));
      
      // Find existing test entry for this user and domain
      const existingTestIndex = diagnosticData.diagnostic_tests.findIndex(
        test => test.userId === TEST_USER.userId && test.domainId === selectedDomain
      );

      const now = new Date().toISOString();

      if (existingTestIndex !== -1) {
        // Update existing entry
        diagnosticData.diagnostic_tests[existingTestIndex] = {
          ...diagnosticData.diagnostic_tests[existingTestIndex],
          completed: true,
          score: simulatedResults.score,
          completedAt: now
        };
        console.log('   ✅ Updated existing diagnostic test entry');
      } else {
        // Add new entry
        diagnosticData.diagnostic_tests.push({
          userId: TEST_USER.userId,
          email: TEST_USER.email,
          domainId: selectedDomain,
          domainName: domainName,
          completed: true,
          startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          score: simulatedResults.score,
          completedAt: now
        });
        console.log('   ✅ Added new diagnostic test entry');
      }

      await fs.writeFile(diagnosticTestsPath, JSON.stringify(diagnosticData, null, 2));
      console.log('   📁 diagnostic_tests.json updated successfully');
      
    } catch (fileError) {
      console.log('   ⚠️  Could not update diagnostic_tests.json:', fileError.message);
    }

    // Create a new test session entry
    console.log('\n📄 Creating test session entry...');
    const testSessionsPath = path.join(__dirname, '..', 'data', 'test-sessions.json');
    
    try {
      let sessionData = [];
      try {
        const sessionFileContent = await fs.readFile(testSessionsPath, 'utf8');
        sessionData = JSON.parse(sessionFileContent);
      } catch (readError) {
        console.log('   📝 Creating new test-sessions.json file');
      }

      const sessionId = `diagnostic-${selectedDomain}-${Date.now()}`;
      const newSession = {
        sessionId: sessionId,
        submission: {
          moduleId: selectedDomain,
          subModuleId: "diagnostic-test",
          userId: TEST_USER.userId,
          testType: "diagnostic",
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          endTime: new Date().toISOString(),
          answers: simulatedResults.answers.reduce((acc, answer, index) => {
            acc[`q${index + 1}`] = answer.userAnswer;
            return acc;
          }, {}),
          timeSpent: 900, // 15 minutes in seconds
          completed: true
        },
        score: simulatedResults.score,
        results: {
          totalQuestions: simulatedResults.totalQuestions,
          correctAnswers: simulatedResults.correctAnswers,
          percentage: simulatedResults.score,
          domain: selectedDomain,
          domainName: domainName,
          feedback: generateFeedback(simulatedResults.score),
          recommendations: generateRecommendations(selectedDomain, simulatedResults.score),
          nextModuleUnlocked: simulatedResults.score >= 70
        },
        timestamp: new Date().toISOString()
      };

      sessionData.push(newSession);
      await fs.writeFile(testSessionsPath, JSON.stringify(sessionData, null, 2));
      console.log('   ✅ Test session created successfully');
      console.log(`   📝 Session ID: ${sessionId}`);
      
    } catch (sessionError) {
      console.log('   ⚠️  Could not create test session:', sessionError.message);
    }

    // Update user's learning progress (create if doesn't exist)
    console.log('\n📄 Updating learning progress...');
    const learningProgressPath = path.join(__dirname, '..', 'data', 'learning-progress.json');
    
    try {
      let progressData = { progress: [] };
      try {
        const progressFileContent = await fs.readFile(learningProgressPath, 'utf8');
        progressData = JSON.parse(progressFileContent);
      } catch (readError) {
        console.log('   📝 Creating new learning-progress.json file');
      }

      // Find or create user progress
      let userProgress = progressData.progress.find(p => p.userId === TEST_USER.userId);
      
      if (!userProgress) {
        userProgress = {
          userId: TEST_USER.userId,
          email: TEST_USER.email,
          overallProgress: 0,
          domains: []
        };
        progressData.progress.push(userProgress);
      }

      // Find or create domain progress
      let domainProgress = userProgress.domains.find(d => d.domain === selectedDomain);
      
      if (!domainProgress) {
        domainProgress = {
          domain: selectedDomain,
          domainName: domainName,
          diagnosticCompleted: false,
          diagnosticScore: 0,
          modules: [],
          progress: 0
        };
        userProgress.domains.push(domainProgress);
      }

      // Update diagnostic completion
      domainProgress.diagnosticCompleted = true;
      domainProgress.diagnosticScore = simulatedResults.score;
      domainProgress.progress = Math.max(domainProgress.progress, 10); // At least 10% for completing diagnostic
      
      // Update overall progress
      const completedDiagnostics = userProgress.domains.filter(d => d.diagnosticCompleted).length;
      userProgress.overallProgress = Math.round((completedDiagnostics / userProgress.domains.length) * 100);

      await fs.writeFile(learningProgressPath, JSON.stringify(progressData, null, 2));
      console.log('   ✅ Learning progress updated successfully');
      
    } catch (progressError) {
      console.log('   ⚠️  Could not update learning progress:', progressError.message);
    }

    console.log('\n🎉 Diagnostic Test Simulation Complete!');
    console.log('\n📋 Summary:');
    console.log(`   👤 User: ${TEST_USER.name}`);
    console.log(`   📚 Domain: ${domainName}`);
    console.log(`   📊 Score: ${simulatedResults.score}%`);
    console.log(`   ✅ Status: ${simulatedResults.score >= 70 ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
    console.log(`   💡 Feedback: ${generateFeedback(simulatedResults.score)}`);

    return {
      success: true,
      user: TEST_USER,
      domain: selectedDomain,
      domainName: domainName,
      results: simulatedResults
    };

  } catch (error) {
    console.error('❌ Error during simulation:', error.message);
    throw error;
  }
}

function generateFeedback(score) {
  if (score >= 90) {
    return "Excellent work! You have a strong understanding of the fundamentals.";
  } else if (score >= 70) {
    return "Good job! You have a solid foundation with some areas to strengthen.";
  } else if (score >= 50) {
    return "You're on the right track! Focus on the recommended areas for improvement.";
  } else {
    return "Let's work together to build your foundational knowledge in this domain.";
  }
}

function generateRecommendations(domain, score) {
  const recommendations = [];
  
  if (score < 70) {
    recommendations.push(`Review fundamental ${domain.replace('-', ' ')} concepts`);
    recommendations.push("Practice with beginner-level exercises");
  }
  
  if (score >= 70 && score < 90) {
    recommendations.push("Explore intermediate topics and real-world projects");
    recommendations.push("Focus on practical applications and best practices");
  }
  
  if (score >= 90) {
    recommendations.push("Challenge yourself with advanced topics");
    recommendations.push("Consider contributing to open-source projects");
  }
  
  return recommendations;
}

// Run the simulation
if (require.main === module) {
  simulateDiagnosticTestCompletion()
    .then((result) => {
      console.log('\n✨ Simulation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Simulation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { simulateDiagnosticTestCompletion };
