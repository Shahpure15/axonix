/**
 * Direct Question Seeding Script for SocraticWingman
 * Seeds comprehensive questions for all domains
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Question Schema (inline for direct usage)
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

// Comprehensive question set
const comprehensiveQuestions = [
  // MACHINE LEARNING
  {
    questionText: "What is the primary goal of supervised learning?",
    questionType: "multiple-choice",
    options: [
      { text: "To find patterns in unlabeled data", isCorrect: false },
      { text: "To predict outcomes based on labeled training data", isCorrect: true },
      { text: "To reduce the dimensionality of data", isCorrect: false },
      { text: "To cluster similar data points", isCorrect: false }
    ],
    explanation: "Supervised learning uses labeled training data to learn a mapping function that can predict outcomes for new, unseen data.",
    difficulty: "beginner",
    domains: ["machine-learning"],
    tags: ["supervised-learning", "basics"],
    points: 1
  },
  {
    questionText: "Which algorithm is best for handling overfitting in decision trees?",
    questionType: "multiple-choice",
    options: [
      { text: "Random Forest", isCorrect: true },
      { text: "Linear Regression", isCorrect: false },
      { text: "K-means", isCorrect: false },
      { text: "SVM", isCorrect: false }
    ],
    explanation: "Random Forest uses ensemble methods and feature randomness to reduce overfitting common in single decision trees.",
    difficulty: "intermediate",
    domains: ["machine-learning"],
    tags: ["ensemble-methods", "overfitting", "random-forest"],
    points: 2
  },

  // DATA SCIENCE
  {
    questionText: "What does 'pandas' library in Python primarily handle?",
    questionType: "multiple-choice",
    options: [
      { text: "Machine learning algorithms", isCorrect: false },
      { text: "Data manipulation and analysis", isCorrect: true },
      { text: "Web scraping", isCorrect: false },
      { text: "Image processing", isCorrect: false }
    ],
    explanation: "Pandas is the primary library for data manipulation, cleaning, and analysis in Python data science workflows.",
    difficulty: "beginner",
    domains: ["data-science"],
    tags: ["pandas", "data-manipulation", "python"],
    points: 1
  },
  {
    questionText: "Which visualization would best show the relationship between two continuous variables?",
    questionType: "multiple-choice",
    options: [
      { text: "Bar chart", isCorrect: false },
      { text: "Pie chart", isCorrect: false },
      { text: "Scatter plot", isCorrect: true },
      { text: "Histogram", isCorrect: false }
    ],
    explanation: "Scatter plots are ideal for showing correlations and relationships between two continuous variables.",
    difficulty: "beginner",
    domains: ["data-science"],
    tags: ["visualization", "scatter-plot", "correlation"],
    points: 1
  },

  // WEB DEVELOPMENT
  {
    questionText: "What does CSS stand for?",
    questionType: "multiple-choice",
    options: [
      { text: "Computer Style Sheets", isCorrect: false },
      { text: "Cascading Style Sheets", isCorrect: true },
      { text: "Creative Style Sheets", isCorrect: false },
      { text: "Colorful Style Sheets", isCorrect: false }
    ],
    explanation: "CSS stands for Cascading Style Sheets, used for styling and layout of web pages.",
    difficulty: "beginner",
    domains: ["web-development"],
    tags: ["css", "basics", "styling"],
    points: 1
  },
  {
    questionText: "Which HTTP method is idempotent and safe?",
    questionType: "multiple-choice",
    options: [
      { text: "POST", isCorrect: false },
      { text: "PUT", isCorrect: false },
      { text: "GET", isCorrect: true },
      { text: "DELETE", isCorrect: false }
    ],
    explanation: "GET requests are both idempotent (multiple requests have same effect) and safe (don't modify server state).",
    difficulty: "intermediate",
    domains: ["web-development"],
    tags: ["http", "rest-api", "get-method"],
    points: 2
  },

  // MOBILE DEVELOPMENT
  {
    questionText: "Which programming language is primarily used for iOS app development?",
    questionType: "multiple-choice",
    options: [
      { text: "Java", isCorrect: false },
      { text: "Swift", isCorrect: true },
      { text: "C#", isCorrect: false },
      { text: "Python", isCorrect: false }
    ],
    explanation: "Swift is Apple's modern programming language specifically designed for iOS and macOS development.",
    difficulty: "beginner",
    domains: ["mobile-development"],
    tags: ["ios", "swift", "apple"],
    points: 1
  },
  {
    questionText: "What is the main advantage of React Native over native development?",
    questionType: "multiple-choice",
    options: [
      { text: "Better performance", isCorrect: false },
      { text: "Cross-platform code sharing", isCorrect: true },
      { text: "Smaller app size", isCorrect: false },
      { text: "Better security", isCorrect: false }
    ],
    explanation: "React Native allows developers to write once and deploy to both iOS and Android platforms, sharing most of the codebase.",
    difficulty: "intermediate",
    domains: ["mobile-development"],
    tags: ["react-native", "cross-platform", "code-sharing"],
    points: 2
  },

  // DEVOPS
  {
    questionText: "What does CI/CD stand for?",
    questionType: "multiple-choice",
    options: [
      { text: "Continuous Integration/Continuous Deployment", isCorrect: true },
      { text: "Code Integration/Code Deployment", isCorrect: false },
      { text: "Continuous Improvement/Continuous Development", isCorrect: false },
      { text: "Central Integration/Central Deployment", isCorrect: false }
    ],
    explanation: "CI/CD stands for Continuous Integration and Continuous Deployment, key practices in modern software development.",
    difficulty: "beginner",
    domains: ["devops"],
    tags: ["ci-cd", "automation", "deployment"],
    points: 1
  },
  {
    questionText: "Which tool is commonly used for container orchestration?",
    questionType: "multiple-choice",
    options: [
      { text: "Docker", isCorrect: false },
      { text: "Kubernetes", isCorrect: true },
      { text: "Jenkins", isCorrect: false },
      { text: "Ansible", isCorrect: false }
    ],
    explanation: "Kubernetes is the leading platform for container orchestration, managing deployment, scaling, and operations of containerized applications.",
    difficulty: "intermediate",
    domains: ["devops"],
    tags: ["kubernetes", "containers", "orchestration"],
    points: 2
  },

  // CYBERSECURITY
  {
    questionText: "What does the principle of 'least privilege' mean in cybersecurity?",
    questionType: "multiple-choice",
    options: [
      { text: "Users should have minimum necessary access rights", isCorrect: true },
      { text: "Security should be the least priority", isCorrect: false },
      { text: "Use the simplest security measures", isCorrect: false },
      { text: "Privilege escalation should be avoided", isCorrect: false }
    ],
    explanation: "Least privilege means giving users only the minimum access rights necessary to perform their job functions.",
    difficulty: "beginner",
    domains: ["cybersecurity"],
    tags: ["access-control", "security-principles", "least-privilege"],
    points: 1
  },

  // UI/UX DESIGN
  {
    questionText: "What is the primary goal of user experience (UX) design?",
    questionType: "multiple-choice",
    options: [
      { text: "Making products look visually appealing", isCorrect: false },
      { text: "Creating meaningful and relevant experiences for users", isCorrect: true },
      { text: "Reducing development costs", isCorrect: false },
      { text: "Following design trends", isCorrect: false }
    ],
    explanation: "UX design focuses on creating meaningful, relevant, and useful experiences that meet user needs and business goals.",
    difficulty: "beginner",
    domains: ["ui-ux-design"],
    tags: ["ux", "user-experience", "design-principles"],
    points: 1
  },

  // CLOUD COMPUTING
  {
    questionText: "What is the main advantage of cloud computing?",
    questionType: "multiple-choice",
    options: [
      { text: "Better security", isCorrect: false },
      { text: "Scalability and cost-effectiveness", isCorrect: true },
      { text: "Faster processing", isCorrect: false },
      { text: "Local data storage", isCorrect: false }
    ],
    explanation: "Cloud computing offers scalable resources that can be adjusted based on demand, often more cost-effective than maintaining physical infrastructure.",
    difficulty: "beginner",
    domains: ["cloud-computing"],
    tags: ["cloud", "scalability", "cost-effectiveness"],
    points: 1
  }
];

async function seedDatabase() {
  try {
    // Connect directly to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);

    // Clear existing questions
    console.log('🗑️  Clearing existing questions...');
    await Question.deleteMany({});
    
    // Insert new questions
    console.log('🌱 Seeding questions...');
    const result = await Question.insertMany(comprehensiveQuestions);
    console.log(`✅ Successfully seeded ${result.length} questions`);

    // Verify and show statistics
    const totalQuestions = await Question.countDocuments();
    console.log(`📊 Total questions in database: ${totalQuestions}`);

    const domainStats = await Question.aggregate([
      { $unwind: '$domains' },
      { $group: { _id: '$domains', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📈 Questions by domain:');
    domainStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} questions`);
    });

    const difficultyStats = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Questions by difficulty:');
    difficultyStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} questions`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
