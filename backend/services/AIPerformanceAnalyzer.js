/**
 * AI Performance Analysis Service
 * Analyzes user performance data and provides insights for targeted test generation
 */

const UserPerformanceAnalytics = require('../models/UserPerformanceAnalytics');
const { getQuestionsByDomain, getDiagnosticQuestions } = require('../models/DomainQuestions');

class AIPerformanceAnalyzer {
  
  /**
   * Analyze user performance and identify weakness patterns
   */
  static async analyzeUserPerformance(userId) {
    try {
      const analytics = await UserPerformanceAnalytics.findOne({ userId });
      if (!analytics) {
        throw new Error('No performance data found for user');
      }

      const analysis = {
        userId,
        overallProfile: this.generateOverallProfile(analytics),
        domainAnalysis: this.analyzeDomainPerformance(analytics),
        learningPatterns: this.identifyLearningPatterns(analytics),
        weaknessAreas: this.identifyWeaknessAreas(analytics),
        recommendedActions: this.generateRecommendations(analytics),
        nextTestStrategy: this.determineTestStrategy(analytics)
      };

      // Update AI analysis in the database
      analytics.aiAnalysis = {
        lastAnalyzed: new Date(),
        readinessForAdvancement: analysis.overallProfile.readinessLevel,
        suggestedNextTopics: analysis.recommendedActions.focusTopics,
        personalizedTips: analysis.recommendedActions.tips,
        estimatedTimeToMastery: analysis.recommendedActions.estimatedHours,
        confidenceScore: analysis.recommendedActions.confidenceScore
      };
      
      await analytics.save();
      return analysis;

    } catch (error) {
      console.error('Error analyzing user performance:', error);
      throw error;
    }
  }

  /**
   * Generate overall learning profile
   */
  static generateOverallProfile(analytics) {
    const totalQuestions = analytics.responseHistory.length;
    const correctAnswers = analytics.responseHistory.filter(r => r.isCorrect).length;
    const overallAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Calculate learning velocity (improvement over time)
    const recentPerformance = this.calculateRecentPerformance(analytics.responseHistory, 10);
    const olderPerformance = this.calculateOlderPerformance(analytics.responseHistory, 10, 20);
    const improvementRate = recentPerformance - olderPerformance;

    // Determine readiness level
    let readinessLevel = 'not-ready';
    if (overallAccuracy >= 90 && improvementRate >= 0) readinessLevel = 'overqualified';
    else if (overallAccuracy >= 75 && improvementRate >= 0) readinessLevel = 'ready';
    else if (overallAccuracy >= 60) readinessLevel = 'partially-ready';

    return {
      totalQuestionsAttempted: totalQuestions,
      overallAccuracy: Math.round(overallAccuracy),
      improvementRate: Math.round(improvementRate),
      readinessLevel,
      consistencyScore: this.calculateConsistency(analytics.responseHistory),
      averageTimePerQuestion: this.calculateAverageTime(analytics.responseHistory)
    };
  }

  /**
   * Analyze performance by domain
   */
  static analyzeDomainPerformance(analytics) {
    return analytics.domainMetrics.map(domain => {
      const weakTopics = domain.topicPerformance
        .filter(topic => topic.accuracy < 70)
        .sort((a, b) => a.accuracy - b.accuracy);

      const strongTopics = domain.topicPerformance
        .filter(topic => topic.accuracy >= 80)
        .sort((a, b) => b.accuracy - a.accuracy);

      return {
        domain: domain.domain,
        overallAccuracy: Math.round(domain.overallAccuracy),
        totalQuestions: domain.totalQuestionsAttempted,
        weakestTopics: weakTopics.slice(0, 3).map(t => ({
          topic: t.topicName,
          accuracy: Math.round(t.accuracy),
          questionsAttempted: t.questionsAttempted
        })),
        strongestTopics: strongTopics.slice(0, 3).map(t => ({
          topic: t.topicName,
          accuracy: Math.round(t.accuracy),
          questionsAttempted: t.questionsAttempted
        })),
        recommendedFocus: this.getRecommendedFocus(domain)
      };
    });
  }

  /**
   * Identify learning patterns and behavior
   */
  static identifyLearningPatterns(analytics) {
    const responses = analytics.responseHistory;
    
    return {
      preferredQuestionTypes: this.getPreferredQuestionTypes(responses),
      timeManagement: this.analyzeTimeManagement(responses),
      difficultyProgression: this.analyzeDifficultyProgression(responses),
      mistakePatterns: this.identifyMistakePatterns(responses),
      learningStyle: this.determineLearningStyle(analytics)
    };
  }

  /**
   * Identify specific weakness areas for targeted practice
   */
  static identifyWeaknessAreas(analytics) {
    const weaknesses = [];

    analytics.domainMetrics.forEach(domain => {
      domain.topicPerformance.forEach(topic => {
        if (topic.accuracy < 70) {
          const responses = analytics.responseHistory.filter(r => 
            r.topic === topic.topicName && !r.isCorrect
          );

          const commonErrors = this.analyzeCommonErrors(responses);
          
          weaknesses.push({
            domain: domain.domain,
            topic: topic.topicName,
            accuracy: Math.round(topic.accuracy),
            severity: topic.accuracy < 50 ? 'severe' : topic.accuracy < 60 ? 'moderate' : 'mild',
            questionsAttempted: topic.questionsAttempted,
            commonErrors,
            recommendedPractice: this.getRecommendedPractice(topic.topicName, topic.accuracy)
          });
        }
      });
    });

    return weaknesses.sort((a, b) => {
      const severityOrder = { severe: 3, moderate: 2, mild: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate personalized recommendations
   */
  static generateRecommendations(analytics) {
    const weaknesses = this.identifyWeaknessAreas(analytics);
    const overallProfile = this.generateOverallProfile(analytics);

    return {
      focusTopics: weaknesses.slice(0, 3).map(w => w.topic),
      tips: this.generatePersonalizedTips(analytics, weaknesses),
      estimatedHours: this.estimateTimeToImprovement(weaknesses),
      confidenceScore: this.calculateConfidenceScore(analytics),
      nextSteps: this.generateNextSteps(overallProfile, weaknesses)
    };
  }

  /**
   * Determine optimal test generation strategy
   */
  static determineTestStrategy(analytics) {
    const weaknesses = this.identifyWeaknessAreas(analytics);
    const overallProfile = this.generateOverallProfile(analytics);

    let strategy = {
      testType: 'diagnostic', // diagnostic, targeted-practice, mixed-review, advancement
      questionCount: 10,
      difficultyDistribution: { beginner: 40, intermediate: 40, advanced: 20 },
      topicFocus: [],
      adaptiveSettings: {
        increaseTimeLimit: false,
        provideHints: false,
        showExplanations: true
      }
    };

    // Adjust strategy based on performance
    if (overallProfile.overallAccuracy < 60) {
      strategy.testType = 'targeted-practice';
      strategy.difficultyDistribution = { beginner: 70, intermediate: 30, advanced: 0 };
      strategy.topicFocus = weaknesses.slice(0, 2).map(w => w.topic);
      strategy.adaptiveSettings.provideHints = true;
    } else if (overallProfile.overallAccuracy >= 80) {
      strategy.testType = 'advancement';
      strategy.difficultyDistribution = { beginner: 20, intermediate: 40, advanced: 40 };
      strategy.adaptiveSettings.increaseTimeLimit = false;
    } else {
      strategy.testType = 'mixed-review';
      strategy.topicFocus = weaknesses.slice(0, 3).map(w => w.topic);
    }

    return strategy;
  }

  /**
   * Generate targeted test questions based on user weaknesses
   */
  static async generateTargetedTest(userId, domain, questionCount = 10) {
    try {
      const analysis = await this.analyzeUserPerformance(userId);
      const strategy = analysis.nextTestStrategy;

      // Get questions based on strategy
      let questions = [];
      
      if (strategy.topicFocus.length > 0) {
        // Get questions from weak topics
        for (const topic of strategy.topicFocus) {
          const topicQuestions = await this.getQuestionsByTopic(domain, topic, 
            Math.ceil(questionCount / strategy.topicFocus.length));
          questions.push(...topicQuestions);
        }
      } else {
        // Get general questions
        questions = await getDiagnosticQuestions(domain, questionCount);
      }

      // Apply difficulty distribution
      questions = this.applyDifficultyDistribution(questions, strategy.difficultyDistribution);

      return {
        questions: questions.slice(0, questionCount),
        strategy,
        analysis: analysis.weaknessAreas,
        metadata: {
          generatedAt: new Date(),
          targetedTopics: strategy.topicFocus,
          expectedAccuracy: this.predictExpectedAccuracy(analysis, strategy)
        }
      };

    } catch (error) {
      console.error('Error generating targeted test:', error);
      throw error;
    }
  }

  // Helper methods
  static calculateRecentPerformance(responses, count) {
    const recent = responses.slice(-count);
    return recent.length > 0 ? (recent.filter(r => r.isCorrect).length / recent.length) * 100 : 0;
  }

  static calculateOlderPerformance(responses, skip, count) {
    const older = responses.slice(-(skip + count), -skip);
    return older.length > 0 ? (older.filter(r => r.isCorrect).length / older.length) * 100 : 0;
  }

  static calculateConsistency(responses) {
    if (responses.length < 5) return 0;
    
    const windowSize = 5;
    const accuracies = [];
    
    for (let i = windowSize; i <= responses.length; i++) {
      const window = responses.slice(i - windowSize, i);
      const accuracy = (window.filter(r => r.isCorrect).length / window.length) * 100;
      accuracies.push(accuracy);
    }
    
    const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
    const variance = accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
    return Math.max(0, 100 - Math.sqrt(variance));
  }

  static calculateAverageTime(responses) {
    if (responses.length === 0) return 0;
    return responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length;
  }

  static getPreferredQuestionTypes(responses) {
    const types = {};
    responses.forEach(r => {
      if (!types[r.questionType]) types[r.questionType] = { total: 0, correct: 0 };
      types[r.questionType].total++;
      if (r.isCorrect) types[r.questionType].correct++;
    });

    return Object.entries(types).map(([type, data]) => ({
      type,
      accuracy: Math.round((data.correct / data.total) * 100),
      attempts: data.total
    })).sort((a, b) => b.accuracy - a.accuracy);
  }

  static analyzeTimeManagement(responses) {
    const times = responses.map(r => r.timeSpent);
    return {
      averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      fastestTime: Math.min(...times),
      slowestTime: Math.max(...times),
      rushesAnswers: times.filter(t => t < 10).length / times.length > 0.3, // More than 30% under 10 seconds
      takesTooLong: times.filter(t => t > 120).length / times.length > 0.2  // More than 20% over 2 minutes
    };
  }

  static generatePersonalizedTips(analytics, weaknesses) {
    const tips = [];
    
    if (weaknesses.length > 0) {
      tips.push(`Focus on ${weaknesses[0].topic} - you're at ${weaknesses[0].accuracy}% accuracy`);
    }
    
    const timeManagement = this.analyzeTimeManagement(analytics.responseHistory);
    if (timeManagement.rushesAnswers) {
      tips.push("Take more time to read questions carefully before answering");
    }
    if (timeManagement.takesTooLong) {
      tips.push("Try to answer more quickly - aim for 30-60 seconds per question");
    }

    return tips;
  }

  static estimateTimeToImprovement(weaknesses) {
    return weaknesses.length * 2; // Rough estimate: 2 hours per weak topic
  }

  static calculateConfidenceScore(analytics) {
    const dataPoints = analytics.responseHistory.length;
    if (dataPoints < 10) return 30;
    if (dataPoints < 50) return 60;
    if (dataPoints < 100) return 80;
    return 95;
  }

  // Additional helper methods
  static getRecommendedFocus(domainMetric) {
    const weakTopics = domainMetric.topicPerformance
      .filter(topic => topic.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy);
    
    if (weakTopics.length === 0) return 'Continue practicing to maintain proficiency';
    if (weakTopics.length === 1) return `Focus on ${weakTopics[0].topicName}`;
    return `Priority focus: ${weakTopics.slice(0, 2).map(t => t.topicName).join(' and ')}`;
  }

  static analyzeDifficultyProgression(responses) {
    const progression = { beginner: 0, intermediate: 0, advanced: 0 };
    responses.forEach(r => {
      if (r.isCorrect) progression[r.difficulty]++;
    });
    return progression;
  }

  static identifyMistakePatterns(responses) {
    const mistakes = responses.filter(r => !r.isCorrect);
    const patterns = {};
    
    mistakes.forEach(mistake => {
      const key = `${mistake.topic}-${mistake.difficulty}`;
      if (!patterns[key]) patterns[key] = 0;
      patterns[key]++;
    });

    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([pattern, count]) => ({ pattern, frequency: count }));
  }

  static determineLearningStyle(analytics) {
    const responses = analytics.responseHistory;
    const avgTime = this.calculateAverageTime(responses);
    
    if (avgTime < 20) return 'fast-paced';
    if (avgTime > 60) return 'methodical';
    return 'balanced';
  }

  static analyzeCommonErrors(responses) {
    const errors = {};
    responses.forEach(response => {
      const errorType = this.categorizeError(response);
      if (!errors[errorType]) errors[errorType] = 0;
      errors[errorType]++;
    });
    
    return Object.entries(errors)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([error, count]) => ({ type: error, frequency: count }));
  }

  static categorizeError(response) {
    // Simple error categorization based on question type and content
    if (response.questionType === 'multiple-choice') {
      return 'concept-confusion';
    } else if (response.questionType === 'true-false') {
      return 'knowledge-gap';
    }
    return 'general-error';
  }

  static getRecommendedPractice(topicName, accuracy) {
    if (accuracy < 50) {
      return `Start with fundamental ${topicName} concepts and basic exercises`;
    } else if (accuracy < 70) {
      return `Practice intermediate ${topicName} problems with guided solutions`;
    }
    return `Review advanced ${topicName} concepts and edge cases`;
  }

  static generateNextSteps(overallProfile, weaknesses) {
    const steps = [];
    
    if (weaknesses.length > 0) {
      steps.push(`Address ${weaknesses[0].topic} weaknesses first`);
    }
    
    if (overallProfile.overallAccuracy < 60) {
      steps.push('Focus on building foundational knowledge');
    } else if (overallProfile.overallAccuracy >= 80) {
      steps.push('Ready for advanced topics and real-world applications');
    } else {
      steps.push('Continue practicing with mixed difficulty levels');
    }
    
    return steps;
  }

  static async getQuestionsByTopic(domain, topic, count) {
    // This would integrate with your question database
    // For now, return empty array - implement based on your question schema
    return [];
  }

  static applyDifficultyDistribution(questions, distribution) {
    const distributed = [];
    const total = questions.length;
    
    const beginnerCount = Math.floor((distribution.beginner / 100) * total);
    const intermediateCount = Math.floor((distribution.intermediate / 100) * total);
    const advancedCount = total - beginnerCount - intermediateCount;
    
    const beginnerQ = questions.filter(q => q.difficulty === 'beginner').slice(0, beginnerCount);
    const intermediateQ = questions.filter(q => q.difficulty === 'intermediate').slice(0, intermediateCount);
    const advancedQ = questions.filter(q => q.difficulty === 'advanced').slice(0, advancedCount);
    
    return [...beginnerQ, ...intermediateQ, ...advancedQ];
  }

  static predictExpectedAccuracy(analysis, strategy) {
    // Simple prediction based on current performance and strategy
    let expectedAccuracy = analysis.overallProfile.overallAccuracy;
    
    if (strategy.testType === 'targeted-practice') {
      expectedAccuracy += 10; // Targeted practice should improve performance
    } else if (strategy.testType === 'advancement') {
      expectedAccuracy -= 15; // Advancement tests are harder
    }
    
    return Math.max(0, Math.min(100, expectedAccuracy));
  }
}

module.exports = AIPerformanceAnalyzer;
