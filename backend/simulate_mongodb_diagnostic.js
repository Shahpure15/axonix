/**
 * Script to simulate diagnostic test completion by inserting data directly into MongoDB
 */

const mongoose = require('mongoose');
const TestSession = require('./models/TestSession');
const LearningProgress = require('./models/LearningProgress');
const User = require('./models/User');
const { getDiagnosticQuestions } = require('./models/DomainQuestions');

// Load environment variables
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Test user data
const TEST_USER = {
  userId: "user_1755926963360_eimr76fz7",
  email: "ajithaadhwaithkumar@gmail.com",
  name: "Adhu"
};

async function simulateDiagnosticTestInMongoDB() {
  try {
    console.log('🚀 Starting MongoDB Diagnostic Test Simulation');
    console.log('👤 User:', TEST_USER.name, `(${TEST_USER.email})`);

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // First, find or create the user in the database
    console.log('\n👤 Finding or creating user in database...');
    let user = await User.findOne({ email: TEST_USER.email });
    
    if (!user) {
      // Create the user if they don't exist
      user = new User({
        name: TEST_USER.name,
        email: TEST_USER.email,
        passwordHash: '$2b$10$hashedpasswordexample', // This would be properly hashed in real scenario
        onboardingCompleted: true,
        learningPreferences: {
          preferredLearningStyle: 'mixed',
          difficultyLevel: 'intermediate'
        }
      });
      await user.save();
      console.log('   📝 Created new user in database');
    } else {
      console.log('   ✅ Found existing user in database');
    }

    const domain = 'web-development';
    const domainName = 'Web Development';
    
    // Get real diagnostic questions from the database
    console.log(`\n📚 Fetching real diagnostic questions for ${domainName}...`);
    const questions = await getDiagnosticQuestions(domain, 5);
    
    if (!questions || questions.length === 0) {
      throw new Error(`No diagnostic questions found for domain: ${domain}`);
    }
    
    console.log(`   ✅ Found ${questions.length} real questions from database`);
    
    // Simulate user answers with realistic accuracy (75%)
    console.log('\n🤔 Simulating user answers...');
    const userAnswers = [];
    const correctAnswers = [];
    
    questions.forEach((question, index) => {
      console.log(`\n   Question ${index + 1}: ${question.questionText}`);
      
      // Simulate 75% accuracy
      const shouldAnswerCorrectly = Math.random() < 0.75;
      let userAnswer;
      let isCorrect = false;
      
      if (question.questionType === 'multiple-choice') {
        if (shouldAnswerCorrectly) {
          const correctOption = question.options.find(opt => opt.isCorrect);
          userAnswer = correctOption ? correctOption.text : question.options[0].text;
          isCorrect = !!correctOption;
        } else {
          const wrongOptions = question.options.filter(opt => !opt.isCorrect);
          userAnswer = wrongOptions.length > 0 ? wrongOptions[0].text : question.options[0].text;
          isCorrect = false;
        }
      } else if (question.questionType === 'true-false') {
        if (shouldAnswerCorrectly) {
          userAnswer = question.correctAnswer;
          isCorrect = true;
        } else {
          userAnswer = question.correctAnswer === 'true' ? 'false' : 'true';
          isCorrect = false;
        }
      }
      
      userAnswers.push(userAnswer);
      correctAnswers.push(isCorrect);
      
      const status = isCorrect ? '✅' : '❌';
      console.log(`      ${status} User answered: ${userAnswer}`);
    });

    const score = correctAnswers.filter(Boolean).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    console.log(`\n📊 Simulating test completion for ${domainName}:`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Correct Answers: ${score}`);
    console.log(`   Score: ${percentage}%`);

    // 1. Create Test Session in MongoDB
    console.log('\n📝 Creating Test Session in MongoDB...');
    
    // Create questions with user answers for test session
    const questionsWithAnswers = questions.map((question, index) => ({
      questionId: question._id,
      userAnswer: userAnswers[index],
      isCorrect: correctAnswers[index],
      points: correctAnswers[index] ? (question.points || 1) : 0
    }));

    const testSession = new TestSession({
      userId: user._id, // Use the MongoDB ObjectId
      domain: domain,
      testType: 'diagnostic',
      questions: questionsWithAnswers,
      totalQuestions: totalQuestions,
      correctAnswers: score,
      score: questionsWithAnswers.reduce((sum, q) => sum + q.points, 0),
      status: 'completed',
      startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      completedAt: new Date()
    });

    const savedSession = await testSession.save();
    console.log(`   ✅ Test Session created with ID: ${savedSession._id}`);

    // 2. Update Learning Progress in MongoDB
    console.log('\n📈 Updating Learning Progress in MongoDB...');
    
    let userProgress = await LearningProgress.findOne({ userId: user._id });
    
    if (!userProgress) {
      // Create new learning progress
      userProgress = new LearningProgress({
        userId: user._id,
        email: TEST_USER.email,
        overallProgress: 0,
        domains: []
      });
      console.log('   📝 Creating new learning progress record');
    }

    // Find or create domain progress
    let domainProgress = userProgress.domains.find(d => d.domainName === domainName);
    
    if (!domainProgress) {
      domainProgress = {
        domainName: domainName,
        level: 'beginner', // Required field
        diagnosticCompleted: false,
        diagnosticScore: 0,
        modules: [],
        progress: 0
      };
      userProgress.domains.push(domainProgress);
      console.log(`   📚 Added new domain: ${domainName}`);
    }

    // Update diagnostic completion
    domainProgress.diagnosticCompleted = true;
    domainProgress.diagnosticScore = percentage;
    domainProgress.progress = Math.max(domainProgress.progress, 15); // At least 15% for completing diagnostic
    
    // Update overall progress
    const completedDiagnostics = userProgress.domains.filter(d => d.diagnosticCompleted).length;
    const totalDomains = userProgress.domains.length;
    userProgress.overallProgress = Math.round((completedDiagnostics / totalDomains) * 100);

    await userProgress.save();
    console.log(`   ✅ Learning Progress updated - Overall: ${userProgress.overallProgress}%`);

    // 3. Update User record with last activity
    console.log('\n👤 Updating User record...');
    
    await User.findByIdAndUpdate(
      user._id,
      { 
        lastLogin: new Date(),
        lastActivity: new Date()
      }
    );
    console.log('   ✅ User record updated');

    // 4. Display results
    console.log('\n🎉 Diagnostic Test Simulation Complete!');
    console.log('\n📋 Summary:');
    console.log(`   👤 User: ${TEST_USER.name} (${TEST_USER.email})`);
    console.log(`   📚 Domain: ${domainName}`);
    console.log(`   📊 Score: ${score}/${totalQuestions} (${percentage}%)`);
    console.log(`   ✅ Status: ${percentage >= 70 ? 'PASSED' : 'NEEDS IMPROVEMENT'}`);
    console.log(`   🆔 Session ID: ${savedSession._id}`);
    console.log(`   📈 Overall Progress: ${userProgress.overallProgress}%`);

    console.log('\n📝 Detailed Answers:');
    questions.forEach((question, index) => {
      const status = correctAnswers[index] ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${question.questionText}`);
      console.log(`      User Answer: ${userAnswers[index]}`);
    });

    console.log('\n💡 Feedback:', generateFeedback(percentage));
    
    const recommendations = generateRecommendations(domain, percentage);
    if (recommendations.length > 0) {
      console.log('\n🎯 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    return {
      success: true,
      sessionId: savedSession._id,
      score: percentage,
      userProgress: userProgress.overallProgress
    };

  } catch (error) {
    console.error('❌ Error during MongoDB simulation:', error.message);
    throw error;
  } finally {
    // Close MongoDB connection
    console.log('\n🔌 Closing MongoDB connection...');
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed');
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
    recommendations.push("Focus on basic syntax and core principles");
  }
  
  if (score >= 70 && score < 90) {
    recommendations.push("Explore intermediate topics and real-world projects");
    recommendations.push("Focus on practical applications and best practices");
    recommendations.push("Try building small projects to reinforce learning");
  }
  
  if (score >= 90) {
    recommendations.push("Challenge yourself with advanced topics");
    recommendations.push("Consider contributing to open-source projects");
    recommendations.push("Explore framework-specific concepts");
  }
  
  return recommendations;
}

// Run the simulation
if (require.main === module) {
  simulateDiagnosticTestInMongoDB()
    .then((result) => {
      console.log('\n✨ MongoDB Simulation completed successfully!');
      console.log(`📊 Final Score: ${result.score}%`);
      console.log(`📈 User Progress: ${result.userProgress}%`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 MongoDB Simulation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { simulateDiagnosticTestInMongoDB };
