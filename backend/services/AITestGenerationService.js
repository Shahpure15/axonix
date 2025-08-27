/**
 * AI Test Generation Service
 * Handles the complete flow from user request to AI-generated test delivery
 */

const UserPerformanceAnalytics = require('../models/UserPerformanceAnalytics');
const AIPerformanceAnalyzer = require('./AIPerformanceAnalyzer');
const TestSession = require('../models/TestSession');
const { getDiagnosticQuestions, getQuestionsByDomain } = require('../models/DomainQuestions');
const mongoose = require('mongoose');

// Test Types supported
const TEST_TYPES = {
  REVIEW: 'review',
  PRACTICE: 'practice', 
  TARGETED_PRACTICE: 'targeted-practice',
  WEAK_AREAS: 'weak-areas',
  ADVANCEMENT: 'advancement',
  MIXED_REVIEW: 'mixed-review'
};

// AI Test Creation Schema for storing generated tests
const aiGeneratedTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: Object.values(TEST_TYPES),
    required: true
  },
  aiAnalysis: {
    userWeaknesses: [{
      topic: String,
      accuracy: Number,
      severity: String
    }],
    recommendedStrategy: {
      testType: String,
      difficultyDistribution: {
        beginner: Number,
        intermediate: Number,
        advanced: Number
      },
      focusTopics: [String],
      questionCount: Number
    },
    aiConfidence: Number,
    generatedAt: Date
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    topic: String,
    difficulty: String,
    aiReason: String // Why AI selected this question
  }],
  testMetadata: {
    estimatedDuration: Number, // in minutes
    targetAccuracy: Number,
    adaptiveSettings: {
      allowHints: Boolean,
      showExplanations: Boolean,
      timeLimit: Number
    }
  },
  status: {
    type: String,
    enum: ['generated', 'active', 'completed', 'expired'],
    default: 'generated'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

const AIGeneratedTest = mongoose.model('AIGeneratedTest', aiGeneratedTestSchema);

class AITestGenerationService {
  
  /**
   * Main method: Generate AI-powered test based on user's domain selection
   */
  static async generateTestForUser(userId, domain, testType = TEST_TYPES.REVIEW, questionCount = 10) {
    try {
      console.log(`🤖 Generating ${testType} test for user ${userId} in domain: ${domain}`);
      
      // Step 1: Fetch user's performance analytics
      const analytics = await this.fetchUserAnalytics(userId);
      
      // Step 2: Send analytics to AI and get analysis
      const aiAnalysis = await this.requestAIAnalysis(userId, domain, testType);
      
      // Step 3: Generate questions based on AI recommendations
      const questions = await this.generateQuestionsFromAI(aiAnalysis, domain, questionCount);
      
      // Step 4: Create and store the generated test
      const generatedTest = await this.createGeneratedTest(userId, domain, testType, aiAnalysis, questions);
      
      // Step 5: Prepare test for frontend
      const testForUser = await this.prepareTestForUser(generatedTest);
      
      console.log(`✅ AI Test generated successfully: ${generatedTest._id}`);
      return testForUser;
      
    } catch (error) {
      console.error('❌ Error generating AI test:', error);
      throw new Error(`Failed to generate test: ${error.message}`);
    }
  }

  /**
   * Fetch user's performance analytics for the domain
   */
  static async fetchUserAnalytics(userId) {
    const analytics = await UserPerformanceAnalytics.findOne({ userId });
    if (!analytics) {
      throw new Error('No performance data found. User needs to complete diagnostic test first.');
    }
    return analytics;
  }

  /**
   * Request AI analysis based on user performance
   */
  static async requestAIAnalysis(userId, domain, testType) {
    console.log(`   🧠 Requesting AI analysis for ${testType} test...`);
    
    // Get comprehensive AI analysis
    const aiAnalysis = await AIPerformanceAnalyzer.analyzeUserPerformance(userId);
    
    // Filter analysis for specific domain
    const domainAnalysis = aiAnalysis.domainAnalysis.find(d => d.domain === domain);
    if (!domainAnalysis) {
      throw new Error(`No performance data found for domain: ${domain}`);
    }

    // Adjust strategy based on test type requested
    const adjustedStrategy = this.adjustStrategyForTestType(aiAnalysis.nextTestStrategy, testType, domainAnalysis);
    
    console.log(`   ✅ AI Analysis complete. Strategy: ${adjustedStrategy.testType}`);
    
    return {
      userWeaknesses: aiAnalysis.weaknessAreas.filter(w => w.domain === domain),
      domainPerformance: domainAnalysis,
      recommendedStrategy: adjustedStrategy,
      learningPatterns: aiAnalysis.learningPatterns,
      overallProfile: aiAnalysis.overallProfile
    };
  }

  /**
   * Adjust AI strategy based on user's selected test type
   */
  static adjustStrategyForTestType(baseStrategy, requestedType, domainAnalysis) {
    let strategy = { ...baseStrategy };
    
    switch (requestedType) {
      case TEST_TYPES.REVIEW:
        strategy.testType = 'mixed-review';
        strategy.difficultyDistribution = { beginner: 30, intermediate: 50, advanced: 20 };
        strategy.questionCount = 15;
        strategy.adaptiveSettings.showExplanations = true;
        break;
        
      case TEST_TYPES.WEAK_AREAS:
        strategy.testType = 'targeted-practice';
        strategy.difficultyDistribution = { beginner: 60, intermediate: 40, advanced: 0 };
        strategy.topicFocus = domainAnalysis.weakestTopics.slice(0, 2).map(t => t.topic);
        strategy.adaptiveSettings.allowHints = true;
        break;
        
      case TEST_TYPES.PRACTICE:
        strategy.testType = 'practice';
        strategy.difficultyDistribution = { beginner: 40, intermediate: 40, advanced: 20 };
        strategy.questionCount = 12;
        break;
        
      case TEST_TYPES.ADVANCEMENT:
        strategy.testType = 'advancement';
        strategy.difficultyDistribution = { beginner: 10, intermediate: 40, advanced: 50 };
        strategy.adaptiveSettings.allowHints = false;
        break;
        
      default:
        // Keep base strategy
        break;
    }
    
    return strategy;
  }

  /**
   * Generate questions based on AI recommendations
   */
  static async generateQuestionsFromAI(aiAnalysis, domain, questionCount) {
    console.log(`   📚 Generating ${questionCount} questions based on AI analysis...`);
    
    const strategy = aiAnalysis.recommendedStrategy;
    let questions = [];
    
    try {
      // If we have specific topics to focus on
      if (strategy.topicFocus && strategy.topicFocus.length > 0) {
        console.log(`   🎯 Focusing on topics: ${strategy.topicFocus.join(', ')}`);
        
        // Get questions for each focus topic
        for (const topic of strategy.topicFocus) {
          const topicQuestions = await this.getQuestionsByTopic(domain, topic, Math.ceil(questionCount / strategy.topicFocus.length));
          questions.push(...topicQuestions.map(q => ({
            ...q,
            aiReason: `Weak area: ${topic}`,
            topic: topic
          })));
        }
      } else {
        // Get general questions for the domain
        console.log(`   📖 Getting general questions for ${domain}`);
        const generalQuestions = await getQuestionsByDomain(domain, questionCount);
        questions = generalQuestions.map(q => ({
          ...q,
          aiReason: 'General domain practice',
          topic: this.extractTopicFromQuestion(q.questionText)
        }));
      }

      // Apply difficulty distribution
      questions = this.applyDifficultyDistribution(questions, strategy.difficultyDistribution);
      
      // Shuffle and limit to requested count
      questions = this.shuffleArray(questions).slice(0, questionCount);
      
      console.log(`   ✅ Generated ${questions.length} questions with difficulty mix: ${JSON.stringify(strategy.difficultyDistribution)}`);
      
      return questions;
      
    } catch (error) {
      console.log(`   ⚠️ Fallback to diagnostic questions due to error: ${error.message}`);
      // Fallback to diagnostic questions
      const fallbackQuestions = await getDiagnosticQuestions(domain, questionCount);
      return fallbackQuestions.map(q => ({
        ...q,
        aiReason: 'Fallback selection',
        topic: this.extractTopicFromQuestion(q.questionText)
      }));
    }
  }

  /**
   * Create and store the generated test in MongoDB
   */
  static async createGeneratedTest(userId, domain, testType, aiAnalysis, questions) {
    console.log(`   💾 Storing generated test in database...`);
    
    const generatedTest = new AIGeneratedTest({
      userId,
      domain,
      testType,
      aiAnalysis: {
        userWeaknesses: aiAnalysis.userWeaknesses,
        recommendedStrategy: aiAnalysis.recommendedStrategy,
        aiConfidence: aiAnalysis.overallProfile.consistencyScore || 70,
        generatedAt: new Date()
      },
      questions: questions.map(q => ({
        questionId: q._id,
        topic: q.topic,
        difficulty: q.difficulty,
        aiReason: q.aiReason
      })),
      testMetadata: {
        estimatedDuration: Math.ceil(questions.length * 1.5), // 1.5 minutes per question
        targetAccuracy: this.calculateTargetAccuracy(aiAnalysis),
        adaptiveSettings: aiAnalysis.recommendedStrategy.adaptiveSettings || {
          allowHints: false,
          showExplanations: true,
          timeLimit: questions.length * 90 // 90 seconds per question
        }
      },
      status: 'generated'
    });

    await generatedTest.save();
    console.log(`   ✅ Test stored with ID: ${generatedTest._id}`);
    
    return generatedTest;
  }

  /**
   * Prepare test data for frontend consumption
   */
  static async prepareTestForUser(generatedTest) {
    console.log(`   🎨 Preparing test for user interface...`);
    
    // Populate questions with full question data
    const questionIds = generatedTest.questions.map(q => q.questionId);
    const fullQuestions = await this.getFullQuestionsByIds(questionIds);
    
    // Remove correct answers for security (frontend shouldn't see them)
    const sanitizedQuestions = fullQuestions.map((question, index) => {
      const testQuestion = generatedTest.questions[index];
      
      return {
        _id: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options ? question.options.map(opt => ({
          text: opt.text,
          // Don't send isCorrect to frontend
        })) : undefined,
        difficulty: question.difficulty,
        points: question.points || 1,
        topic: testQuestion.topic,
        aiReason: testQuestion.aiReason,
        hints: question.hints || []
      };
    });

    return {
      testId: generatedTest._id,
      domain: generatedTest.domain,
      testType: generatedTest.testType,
      questions: sanitizedQuestions,
      metadata: {
        totalQuestions: sanitizedQuestions.length,
        estimatedDuration: generatedTest.testMetadata.estimatedDuration,
        targetAccuracy: generatedTest.testMetadata.targetAccuracy,
        allowHints: generatedTest.testMetadata.adaptiveSettings.allowHints,
        showExplanations: generatedTest.testMetadata.adaptiveSettings.showExplanations,
        timeLimit: generatedTest.testMetadata.adaptiveSettings.timeLimit
      },
      aiInsights: {
        weaknessAreas: generatedTest.aiAnalysis.userWeaknesses.map(w => w.topic),
        focusTopics: generatedTest.aiAnalysis.recommendedStrategy.focusTopics,
        aiConfidence: generatedTest.aiAnalysis.aiConfidence,
        testPurpose: this.getTestPurposeMessage(generatedTest.testType, generatedTest.aiAnalysis.userWeaknesses)
      },
      instructions: this.generateTestInstructions(generatedTest)
    };
  }

  /**
   * Submit completed AI-generated test and update analytics
   */
  static async submitAIGeneratedTest(testId, userId, answers) {
    try {
      console.log(`📤 Submitting AI-generated test: ${testId}`);
      
      // Get the generated test
      const generatedTest = await AIGeneratedTest.findById(testId);
      if (!generatedTest || generatedTest.userId.toString() !== userId) {
        throw new Error('Test not found or unauthorized');
      }

      // Get full questions for grading
      const questionIds = generatedTest.questions.map(q => q.questionId);
      const fullQuestions = await this.getFullQuestionsByIds(questionIds);
      
      // Grade the test
      const gradingResult = await this.gradeAITest(fullQuestions, answers);
      
      // Create test session record
      const testSession = await this.createTestSession(generatedTest, gradingResult, answers);
      
      // Update user performance analytics
      await this.updatePerformanceAnalytics(userId, generatedTest, gradingResult, fullQuestions, answers);
      
      // Mark test as completed
      generatedTest.status = 'completed';
      await generatedTest.save();
      
      console.log(`✅ AI test submitted successfully. Score: ${gradingResult.percentage}%`);
      
      return {
        sessionId: testSession._id,
        score: gradingResult.score,
        totalQuestions: gradingResult.totalQuestions,
        percentage: gradingResult.percentage,
        results: gradingResult.results,
        improvements: await this.analyzeImprovements(userId, generatedTest.domain),
        nextRecommendations: await this.getNextRecommendations(userId, generatedTest.domain)
      };
      
    } catch (error) {
      console.error('❌ Error submitting AI test:', error);
      throw error;
    }
  }

  // Helper methods
  static async getQuestionsByTopic(domain, topic, count) {
    // This would implement topic-specific question retrieval
    // For now, fallback to domain questions
    const questions = await getQuestionsByDomain(domain, count * 2);
    return questions.slice(0, count);
  }

  static extractTopicFromQuestion(questionText) {
    const text = questionText.toLowerCase();
    if (text.includes('css')) return 'CSS Fundamentals';
    if (text.includes('html')) return 'HTML Basics';
    if (text.includes('javascript')) return 'JavaScript Core';
    if (text.includes('http')) return 'HTTP & Web APIs';
    return 'General';
  }

  static applyDifficultyDistribution(questions, distribution) {
    const total = questions.length;
    const beginnerCount = Math.ceil((distribution.beginner / 100) * total);
    const intermediateCount = Math.ceil((distribution.intermediate / 100) * total);
    
    const beginnerQ = questions.filter(q => q.difficulty === 'beginner').slice(0, beginnerCount);
    const intermediateQ = questions.filter(q => q.difficulty === 'intermediate').slice(0, intermediateCount);
    const advancedQ = questions.filter(q => q.difficulty === 'advanced').slice(0, total - beginnerQ.length - intermediateQ.length);
    
    return [...beginnerQ, ...intermediateQ, ...advancedQ];
  }

  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static calculateTargetAccuracy(aiAnalysis) {
    const currentAccuracy = aiAnalysis.overallProfile.overallAccuracy;
    return Math.min(90, currentAccuracy + 10); // Target 10% improvement
  }

  static async getFullQuestionsByIds(questionIds) {
    // This would query the actual question collections
    // Implementation depends on your domain question structure
    const { getQuestionsByDomain } = require('../models/DomainQuestions');
    
    // For now, get from any domain - this should be improved
    try {
      const questions = await getQuestionsByDomain('web-development', 100);
      return questions.filter(q => questionIds.some(id => id.toString() === q._id.toString()));
    } catch (error) {
      console.log('Warning: Could not fetch full questions, using fallback');
      return questionIds.map(id => ({ _id: id, questionText: 'Question not found', questionType: 'multiple-choice', options: [] }));
    }
  }

  static getTestPurposeMessage(testType, weaknesses) {
    switch (testType) {
      case TEST_TYPES.WEAK_AREAS:
        return `This test focuses on your weak areas: ${weaknesses.slice(0, 2).map(w => w.topic).join(', ')}`;
      case TEST_TYPES.REVIEW:
        return 'This is a comprehensive review test covering various topics';
      case TEST_TYPES.ADVANCEMENT:
        return 'This advanced test will challenge your knowledge and push your boundaries';
      default:
        return 'This test is personalized based on your learning progress';
    }
  }

  static generateTestInstructions(generatedTest) {
    return {
      timeLimit: generatedTest.testMetadata.adaptiveSettings.timeLimit,
      allowHints: generatedTest.testMetadata.adaptiveSettings.allowHints,
      showExplanations: generatedTest.testMetadata.adaptiveSettings.showExplanations,
      message: `This AI-generated test contains ${generatedTest.questions.length} questions tailored to your learning needs.`
    };
  }

  static async gradeAITest(questions, answers) {
    // Implementation for grading logic
    let correct = 0;
    const results = [];
    
    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      let isCorrect = false;
      
      if (question.questionType === 'multiple-choice') {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        isCorrect = correctOption && correctOption.text === userAnswer;
      } else if (question.questionType === 'true-false') {
        isCorrect = question.correctAnswer === userAnswer;
      }
      
      if (isCorrect) correct++;
      results.push({ questionIndex: index, isCorrect, userAnswer });
    });
    
    return {
      score: correct,
      totalQuestions: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      results
    };
  }

  static async createTestSession(generatedTest, gradingResult, answers) {
    // Create a test session record
    return new TestSession({
      userId: generatedTest.userId,
      domain: generatedTest.domain,
      testType: 'ai-generated',
      questions: generatedTest.questions.map((q, index) => ({
        questionId: q.questionId,
        userAnswer: answers[index],
        isCorrect: gradingResult.results[index].isCorrect,
        points: gradingResult.results[index].isCorrect ? 1 : 0
      })),
      totalQuestions: gradingResult.totalQuestions,
      correctAnswers: gradingResult.score,
      score: gradingResult.score,
      status: 'completed',
      startedAt: new Date(Date.now() - 10 * 60 * 1000), // Assume 10 minutes ago
      completedAt: new Date()
    }).save();
  }

  static async updatePerformanceAnalytics(userId, generatedTest, gradingResult, questions, answers) {
    // Update the user's performance analytics with new data
    const analytics = await UserPerformanceAnalytics.findOne({ userId });
    if (!analytics) return;

    // Add detailed responses
    questions.forEach((question, index) => {
      const response = {
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        difficulty: question.difficulty,
        topic: generatedTest.questions[index].topic,
        correctAnswer: this.getCorrectAnswerFromQuestion(question),
        userAnswer: answers[index],
        isCorrect: gradingResult.results[index].isCorrect,
        timeSpent: 60, // Default time
        confidenceLevel: 'medium',
        domain: generatedTest.domain
      };
      
      analytics.addResponse(response);
    });

    await analytics.save();
  }

  static getCorrectAnswerFromQuestion(question) {
    if (question.questionType === 'multiple-choice') {
      const correct = question.options?.find(opt => opt.isCorrect);
      return correct ? correct.text : null;
    }
    return question.correctAnswer || null;
  }

  static async analyzeImprovements(userId, domain) {
    // Analyze how user improved compared to previous tests
    return { message: 'Performance analysis in progress...' };
  }

  static async getNextRecommendations(userId, domain) {
    // Get AI recommendations for next steps
    const analysis = await AIPerformanceAnalyzer.analyzeUserPerformance(userId);
    return analysis.recommendedActions.nextSteps || [];
  }
}

module.exports = {
  AITestGenerationService,
  AIGeneratedTest,
  TEST_TYPES
};
