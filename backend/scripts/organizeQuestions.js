/**
 * Question Management Utilities
 * Tools for managing and organizing questions in the database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Question Schema
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true, trim: true },
  questionType: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'short-answer', 'coding'],
    required: true 
  },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  correctAnswer: { type: String, required: false },
  explanation: { type: String, trim: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true 
  },
  domains: [{
    type: String,
    required: true,
    enum: [
      'machine-learning', 'data-science', 'web-development',
      'mobile-development', 'devops', 'cybersecurity',
      'blockchain', 'game-development', 'ui-ux-design', 'cloud-computing'
    ]
  }],
  tags: [{ type: String, trim: true }],
  points: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Use environment variable for collection name
const collectionName = process.env.QUESTIONS_COLLECTION || 'questions';
const Question = mongoose.model('Question', questionSchema, collectionName);

async function organizeQuestions() {
  try {
    // Connect directly to MongoDB using the same URI
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);

    // Get all current questions
    const questions = await Question.find({});
    console.log(`📊 Found ${questions.length} questions in database`);

    // Organize by domain and difficulty
    const organization = {};
    
    questions.forEach(question => {
      question.domains.forEach(domain => {
        if (!organization[domain]) {
          organization[domain] = {
            beginner: [],
            intermediate: [],
            advanced: []
          };
        }
        organization[domain][question.difficulty].push({
          id: question._id,
          text: question.questionText.substring(0, 80) + '...',
          type: question.questionType,
          tags: question.tags
        });
      });
    });

    // Display organization
    console.log('\n📚 QUESTION ORGANIZATION BY DOMAIN:');
    console.log('=' .repeat(50));
    
    Object.keys(organization).forEach(domain => {
      console.log(`\n🔹 ${domain.toUpperCase()}`);
      console.log(`   Beginner: ${organization[domain].beginner.length} questions`);
      console.log(`   Intermediate: ${organization[domain].intermediate.length} questions`);
      console.log(`   Advanced: ${organization[domain].advanced.length} questions`);
      console.log(`   Total: ${organization[domain].beginner.length + organization[domain].intermediate.length + organization[domain].advanced.length} questions`);
    });

    // Check for missing domains
    const expectedDomains = [
      'machine-learning',
      'data-science', 
      'web-development',
      'mobile-development',
      'devops',
      'cybersecurity',
      'blockchain',
      'game-development',
      'ui-ux-design',
      'cloud-computing'
    ];

    const missingDomains = expectedDomains.filter(domain => !organization[domain]);
    
    if (missingDomains.length > 0) {
      console.log('\n⚠️  MISSING DOMAINS:');
      missingDomains.forEach(domain => console.log(`   - ${domain}`));
    }

    // Generate statistics
    const stats = {
      totalQuestions: questions.length,
      byType: {},
      byDifficulty: {},
      byDomain: {}
    };

    questions.forEach(q => {
      // Count by type
      stats.byType[q.questionType] = (stats.byType[q.questionType] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      
      // Count by domain
      q.domains.forEach(domain => {
        stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
      });
    });

    console.log('\n📈 STATISTICS:');
    console.log('=' .repeat(30));
    console.log(`Total Questions: ${stats.totalQuestions}`);
    console.log('\nBy Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('\nBy Difficulty:');
    Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
      console.log(`  ${diff}: ${count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error organizing questions:', error);
    process.exit(1);
  }
}

organizeQuestions();
