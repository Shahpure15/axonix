/**
 * Enhanced simulation script that stores detailed performance analytics
 * for AI-driven test generation
 */

const mongoose = require('mongoose');
const TestSession = require('./models/TestSession');
const LearningProgress = require('./models/LearningProgress');
const User = require('./models/User');
const UserPerformanceAnalytics = require('./models/UserPerformanceAnalytics');
const AIPerformanceAnalyzer = require('./services/AIPerformanceAnalyzer');
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

// Topic mapping for detailed analytics
const TOPIC_MAPPING = {
  'web-development': {
    'CSS Fundamentals': ['syntax', 'selectors', 'properties', 'cascading'],
    'HTML Basics': ['tags', 'attributes', 'semantic-html', 'forms'],
    'JavaScript Core': ['variables', 'functions', 'objects', 'arrays'],
    'HTTP & Web APIs': ['methods', 'status-codes', 'REST', 'requests'],
    'Web Development Tools': ['debugging', 'dev-tools', 'performance']
  }
};

async function simulateEnhancedDiagnosticTest() {
  try {
    console.log('🚀 Starting Enhanced Diagnostic Test Simulation with AI Analytics');
    console.log('👤 User:', TEST_USER.name, `(${TEST_USER.email})`);

    // Connect to MongoDB
    console.log('\n🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Find user
    const user = await User.findOne({ email: TEST_USER.email });
    if (!user) {
      throw new Error('User not found');
    }

    const domain = 'web-development';
    const domainName = 'Web Development';
    
    // Get real diagnostic questions
    console.log(`\n📚 Fetching diagnostic questions for ${domainName}...`);
    const questions = await getDiagnosticQuestions(domain, 8);
    
    if (!questions || questions.length === 0) {
      throw new Error(`No questions found for domain: ${domain}`);
    }
    
    console.log(`   ✅ Found ${questions.length} questions`);

    // Enhanced simulation with detailed response tracking
    console.log('\n🤔 Simulating detailed user responses...');
    const detailedResponses = [];
    const userAnswers = [];
    const correctAnswers = [];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const startTime = Date.now();
      
      // Assign topic and subtopic based on question content
      const { topic, subtopic } = assignTopicToQuestion(question.questionText);
      
      // Simulate realistic response patterns
      const responsePattern = simulateResponsePattern(question, i, questions.length);
      
      userAnswers.push(responsePattern.answer);
      correctAnswers.push(responsePattern.isCorrect);
      
      // Calculate time spent (realistic simulation)
      const timeSpent = Math.floor(Math.random() * 45) + 15; // 15-60 seconds
      
      // Create detailed response record
      const detailedResponse = {
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        difficulty: question.difficulty,
        topic: topic,
        subtopic: subtopic,
        correctAnswer: getCorrectAnswer(question),
        userAnswer: responsePattern.answer,
        isCorrect: responsePattern.isCorrect,
        timeSpent: timeSpent,
        confidenceLevel: responsePattern.confidence,
        attemptNumber: 1,
        hints_used: 0,
        domain: domain
      };
      
      detailedResponses.push(detailedResponse);
      
      const status = responsePattern.isCorrect ? '✅' : '❌';
      console.log(`   ${i + 1}. ${status} [${topic}] ${question.questionText.substring(0, 50)}...`);
      console.log(`      Answer: ${responsePattern.answer} (${timeSpent}s, ${responsePattern.confidence} confidence)`);
    }

    const score = correctAnswers.filter(Boolean).length;
    const totalQuestions = questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    console.log(`\n📊 Test Results: ${score}/${totalQuestions} (${percentage}%)`);

    // Create Test Session
    console.log('\n📝 Creating Test Session...');
    const questionsWithAnswers = questions.map((question, index) => ({
      questionId: question._id,
      userAnswer: userAnswers[index],
      isCorrect: correctAnswers[index],
      points: correctAnswers[index] ? (question.points || 1) : 0
    }));

    const testSession = new TestSession({
      userId: user._id,
      domain: domain,
      testType: 'diagnostic',
      questions: questionsWithAnswers,
      totalQuestions: totalQuestions,
      correctAnswers: score,
      score: questionsWithAnswers.reduce((sum, q) => sum + q.points, 0),
      status: 'completed',
      startedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      completedAt: new Date()
    });

    const savedSession = await testSession.save();
    console.log(`   ✅ Test Session created: ${savedSession._id}`);

    // Create/Update Performance Analytics
    console.log('\n📈 Updating Performance Analytics...');
    let analytics = await UserPerformanceAnalytics.findOne({ userId: user._id });
    
    if (!analytics) {
      analytics = new UserPerformanceAnalytics({
        userId: user._id,
        responseHistory: [],
        domainMetrics: [],
        learningProfile: {
          preferredDifficulty: 'beginner',
          learningSpeed: 'average',
          strongestDomains: [],
          weakestDomains: [],
          recommendedFocusAreas: []
        },
        sessionHistory: []
      });
    }

    // Add all detailed responses
    detailedResponses.forEach(response => {
      analytics.addResponse(response);
    });

    // Add session to history
    analytics.sessionHistory.push({
      sessionId: savedSession._id,
      sessionType: 'diagnostic',
      domain: domain,
      startTime: testSession.startedAt,
      endTime: testSession.completedAt,
      questionsAttempted: totalQuestions,
      accuracy: percentage,
      improvementFromLastSession: 0 // Will be calculated in future sessions
    });

    await analytics.save();
    console.log('   ✅ Performance Analytics updated');

    // Run AI Analysis
    console.log('\n🤖 Running AI Performance Analysis...');
    const aiAnalysis = await AIPerformanceAnalyzer.analyzeUserPerformance(user._id);
    
    console.log('\n🎯 AI Analysis Results:');
    console.log(`   Overall Accuracy: ${aiAnalysis.overallProfile.overallAccuracy}%`);
    console.log(`   Readiness Level: ${aiAnalysis.overallProfile.readinessLevel}`);
    console.log(`   Improvement Rate: ${aiAnalysis.overallProfile.improvementRate}%`);
    
    if (aiAnalysis.weaknessAreas.length > 0) {
      console.log('\n⚠️  Identified Weaknesses:');
      aiAnalysis.weaknessAreas.slice(0, 3).forEach((weakness, index) => {
        console.log(`   ${index + 1}. ${weakness.topic} (${weakness.accuracy}% accuracy - ${weakness.severity})`);
      });
    }

    if (aiAnalysis.recommendedActions.focusTopics.length > 0) {
      console.log('\n💡 AI Recommendations:');
      aiAnalysis.recommendedActions.focusTopics.forEach((topic, index) => {
        console.log(`   ${index + 1}. Focus on: ${topic}`);
      });
    }

    console.log('\n🎮 Next Test Strategy:');
    console.log(`   Type: ${aiAnalysis.nextTestStrategy.testType}`);
    console.log(`   Question Count: ${aiAnalysis.nextTestStrategy.questionCount}`);
    console.log(`   Difficulty Mix: ${JSON.stringify(aiAnalysis.nextTestStrategy.difficultyDistribution)}`);
    if (aiAnalysis.nextTestStrategy.topicFocus.length > 0) {
      console.log(`   Focus Topics: ${aiAnalysis.nextTestStrategy.topicFocus.join(', ')}`);
    }

    // Generate a targeted test for next session
    console.log('\n🎯 Generating Targeted Test for Next Session...');
    const targetedTest = await AIPerformanceAnalyzer.generateTargetedTest(user._id, domain, 5);
    
    console.log(`   ✅ Generated ${targetedTest.questions.length} targeted questions`);
    console.log(`   📊 Expected Accuracy: ${targetedTest.metadata.expectedAccuracy}%`);
    console.log(`   🎯 Targeting Topics: ${targetedTest.metadata.targetedTopics.join(', ')}`);

    console.log('\n🎉 Enhanced Simulation Complete!');
    console.log('\n📋 Summary:');
    console.log(`   👤 User: ${TEST_USER.name}`);
    console.log(`   📚 Domain: ${domainName}`);
    console.log(`   📊 Score: ${score}/${totalQuestions} (${percentage}%)`);
    console.log(`   🤖 AI Confidence: ${aiAnalysis.recommendedActions.confidenceScore}%`);
    console.log(`   🔮 Estimated Time to Improve: ${aiAnalysis.recommendedActions.estimatedHours} hours`);

    return {
      success: true,
      sessionId: savedSession._id,
      score: percentage,
      aiAnalysis,
      targetedTest
    };

  } catch (error) {
    console.error('❌ Error during enhanced simulation:', error.message);
    throw error;
  } finally {
    console.log('\n🔌 Closing MongoDB connection...');
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed');
  }
}

// Helper functions
function assignTopicToQuestion(questionText) {
  const text = questionText.toLowerCase();
  
  // Simple topic assignment based on keywords
  if (text.includes('css') || text.includes('style') || text.includes('selector')) {
    return { topic: 'CSS Fundamentals', subtopic: 'basic-syntax' };
  } else if (text.includes('html') || text.includes('tag') || text.includes('element')) {
    return { topic: 'HTML Basics', subtopic: 'tags-attributes' };
  } else if (text.includes('javascript') || text.includes('function') || text.includes('variable')) {
    return { topic: 'JavaScript Core', subtopic: 'fundamentals' };
  } else if (text.includes('http') || text.includes('request') || text.includes('method')) {
    return { topic: 'HTTP & Web APIs', subtopic: 'http-methods' };
  } else {
    return { topic: 'Web Development Tools', subtopic: 'general' };
  }
}

function simulateResponsePattern(question, questionIndex, totalQuestions) {
  // Simulate realistic performance patterns
  let accuracyRate = 0.7; // Base 70% accuracy
  
  // User gets tired towards the end
  if (questionIndex > totalQuestions * 0.7) {
    accuracyRate -= 0.1;
  }
  
  // Lower accuracy for advanced questions
  if (question.difficulty === 'advanced') {
    accuracyRate -= 0.2;
  } else if (question.difficulty === 'intermediate') {
    accuracyRate -= 0.1;
  }
  
  const isCorrect = Math.random() < accuracyRate;
  
  // Simulate answer
  let answer;
  if (question.questionType === 'multiple-choice') {
    if (isCorrect) {
      const correctOption = question.options.find(opt => opt.isCorrect);
      answer = correctOption ? correctOption.text : question.options[0].text;
    } else {
      const wrongOptions = question.options.filter(opt => !opt.isCorrect);
      answer = wrongOptions.length > 0 ? wrongOptions[0].text : question.options[0].text;
    }
  } else if (question.questionType === 'true-false') {
    answer = isCorrect ? question.correctAnswer : (question.correctAnswer === 'true' ? 'false' : 'true');
  }
  
  // Simulate confidence based on correctness and difficulty
  let confidence = 'medium';
  if (isCorrect && question.difficulty === 'beginner') confidence = 'high';
  else if (!isCorrect && question.difficulty === 'advanced') confidence = 'low';
  else if (Math.random() < 0.3) confidence = Math.random() < 0.5 ? 'low' : 'high';
  
  return { answer, isCorrect, confidence };
}

function getCorrectAnswer(question) {
  if (question.questionType === 'multiple-choice') {
    const correctOption = question.options.find(opt => opt.isCorrect);
    return correctOption ? correctOption.text : null;
  } else if (question.questionType === 'true-false') {
    return question.correctAnswer;
  }
  return null;
}

// Run the simulation
if (require.main === module) {
  simulateEnhancedDiagnosticTest()
    .then((result) => {
      console.log('\n✨ Enhanced simulation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Enhanced simulation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { simulateEnhancedDiagnosticTest };
