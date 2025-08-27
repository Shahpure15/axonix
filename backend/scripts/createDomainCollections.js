/**
 * Domain-Specific Question Collection Creator
 * Organizes questions into separate collections by domain
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Question Schema (reusable)
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
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

// Domain-specific question sets
const domainQuestions = {
  'machine-learning': [
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
    {
      questionText: "What is the curse of dimensionality in machine learning?",
      questionType: "multiple-choice",
      options: [
        { text: "Too many features making algorithms slow", isCorrect: false },
        { text: "Data becomes sparse in high-dimensional spaces", isCorrect: true },
        { text: "Memory limitations with large datasets", isCorrect: false },
        { text: "Difficulty in visualizing data", isCorrect: false }
      ],
      explanation: "As dimensions increase, data points become increasingly sparse, making it harder to find meaningful patterns and relationships.",
      difficulty: "advanced",
      domains: ["machine-learning"],
      tags: ["dimensionality", "feature-engineering", "advanced"],
      points: 3
    }
  ],

  'data-science': [
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
    {
      questionText: "What is the purpose of cross-validation in data science?",
      questionType: "multiple-choice",
      options: [
        { text: "To clean messy data", isCorrect: false },
        { text: "To assess model performance and prevent overfitting", isCorrect: true },
        { text: "To reduce dataset size", isCorrect: false },
        { text: "To visualize data patterns", isCorrect: false }
      ],
      explanation: "Cross-validation helps evaluate how well a model generalizes to unseen data by training and testing on different data splits.",
      difficulty: "intermediate",
      domains: ["data-science"],
      tags: ["cross-validation", "model-evaluation", "overfitting"],
      points: 2
    }
  ],

  'web-development': [
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
    {
      questionText: "What is the Virtual DOM in React?",
      questionType: "multiple-choice",
      options: [
        { text: "A backup copy of the real DOM", isCorrect: false },
        { text: "A JavaScript representation of the DOM for efficient updates", isCorrect: true },
        { text: "A debugging tool for DOM elements", isCorrect: false },
        { text: "A way to hide DOM elements", isCorrect: false }
      ],
      explanation: "Virtual DOM is React's in-memory representation of the real DOM that enables efficient diffing and batch updates.",
      difficulty: "advanced",
      domains: ["web-development"],
      tags: ["react", "virtual-dom", "performance"],
      points: 3
    }
  ],

  'mobile-development': [
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
    }
  ],

  'devops': [
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
    }
  ],

  'cybersecurity': [
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
    {
      questionText: "What is a zero-day vulnerability?",
      questionType: "multiple-choice",
      options: [
        { text: "A vulnerability discovered on day zero of development", isCorrect: false },
        { text: "A security flaw that has no known patch or fix", isCorrect: true },
        { text: "A vulnerability that expires after one day", isCorrect: false },
        { text: "A fake vulnerability used for testing", isCorrect: false }
      ],
      explanation: "Zero-day vulnerabilities are security flaws that are unknown to security vendors and have no available patches, making them extremely dangerous.",
      difficulty: "intermediate",
      domains: ["cybersecurity"],
      tags: ["zero-day", "vulnerabilities", "security-threats"],
      points: 2
    }
  ],

  'ui-ux-design': [
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
    {
      questionText: "What does the 'F-pattern' refer to in web design?",
      questionType: "multiple-choice",
      options: [
        { text: "A layout that looks like the letter F", isCorrect: false },
        { text: "How users typically scan web content", isCorrect: true },
        { text: "A responsive design framework", isCorrect: false },
        { text: "A color scheme pattern", isCorrect: false }
      ],
      explanation: "The F-pattern describes how users typically read web content - horizontally across the top, then down and across again, forming an F shape.",
      difficulty: "intermediate",
      domains: ["ui-ux-design"],
      tags: ["f-pattern", "user-behavior", "web-design"],
      points: 2
    }
  ],

  'cloud-computing': [
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
    },
    {
      questionText: "What does 'Infrastructure as a Service' (IaaS) provide?",
      questionType: "multiple-choice",
      options: [
        { text: "Complete software applications", isCorrect: false },
        { text: "Development platforms and tools", isCorrect: false },
        { text: "Virtualized computing resources over the internet", isCorrect: true },
        { text: "Database management only", isCorrect: false }
      ],
      explanation: "IaaS provides virtualized computing infrastructure including servers, storage, and networking resources over the internet.",
      difficulty: "intermediate",
      domains: ["cloud-computing"],
      tags: ["iaas", "infrastructure", "cloud-services"],
      points: 2
    }
  ]
};

// Collection name mapping
const domainCollectionMap = {
  'machine-learning': process.env.QUESTIONS_ML_COLLECTION,
  'data-science': process.env.QUESTIONS_DS_COLLECTION,
  'web-development': process.env.QUESTIONS_WEB_COLLECTION,
  'mobile-development': process.env.QUESTIONS_MOBILE_COLLECTION,
  'devops': process.env.QUESTIONS_DEVOPS_COLLECTION,
  'cybersecurity': process.env.QUESTIONS_SECURITY_COLLECTION,
  'blockchain': process.env.QUESTIONS_BLOCKCHAIN_COLLECTION,
  'game-development': process.env.QUESTIONS_GAME_COLLECTION,
  'ui-ux-design': process.env.QUESTIONS_UIUX_COLLECTION,
  'cloud-computing': process.env.QUESTIONS_CLOUD_COLLECTION
};

async function createDomainCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);

    // Clear existing collections
    console.log('\n🗑️  Clearing existing question collections...');
    const existingCollections = await mongoose.connection.db.listCollections().toArray();
    const questionCollections = existingCollections.filter(c => 
      c.name.includes('question') || c.name === 'socratic_questions'
    );

    for (const collection of questionCollections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`   ❌ Dropped collection: ${collection.name}`);
    }

    console.log('\n🏗️  Creating domain-specific collections...');
    
    let totalQuestions = 0;
    const collectionStats = {};

    // Create collections for each domain
    for (const [domain, questions] of Object.entries(domainQuestions)) {
      const collectionName = domainCollectionMap[domain];
      
      if (!collectionName) {
        console.log(`   ⚠️  No collection name configured for domain: ${domain}`);
        continue;
      }

      console.log(`\n📚 Processing domain: ${domain.toUpperCase()}`);
      console.log(`   Collection: ${collectionName}`);

      // Create model for this specific collection
      const DomainQuestion = mongoose.model(`Question_${domain.replace('-', '_')}`, questionSchema, collectionName);

      // Insert questions for this domain
      const result = await DomainQuestion.insertMany(questions);
      console.log(`   ✅ Inserted ${result.length} questions`);

      // Track statistics
      totalQuestions += result.length;
      collectionStats[domain] = {
        collection: collectionName,
        count: result.length,
        difficulties: questions.reduce((acc, q) => {
          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
          return acc;
        }, {})
      };

      // Create indexes for better performance
      await DomainQuestion.collection.createIndex({ difficulty: 1 });
      await DomainQuestion.collection.createIndex({ tags: 1 });
      await DomainQuestion.collection.createIndex({ isActive: 1 });
      console.log(`   🔍 Created indexes for ${collectionName}`);
    }

    // Display comprehensive statistics
    console.log('\n📊 DOMAIN COLLECTION STATISTICS:');
    console.log('=' .repeat(60));
    
    Object.entries(collectionStats).forEach(([domain, stats]) => {
      console.log(`\n🔹 ${domain.toUpperCase()}`);
      console.log(`   Collection: ${stats.collection}`);
      console.log(`   Total Questions: ${stats.count}`);
      console.log(`   Difficulties:`);
      Object.entries(stats.difficulties).forEach(([diff, count]) => {
        console.log(`     ${diff}: ${count} questions`);
      });
    });

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Questions: ${totalQuestions}`);
    console.log(`   Domain Collections: ${Object.keys(collectionStats).length}`);
    console.log(`   Average per Domain: ${Math.round(totalQuestions / Object.keys(collectionStats).length)}`);

    // Verify collections exist
    console.log('\n🔍 VERIFICATION:');
    const newCollections = await mongoose.connection.db.listCollections().toArray();
    const questionCols = newCollections.filter(c => c.name.startsWith('questions_'));
    
    console.log(`   Created Collections: ${questionCols.length}`);
    for (const col of questionCols) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`     📦 ${col.name}: ${count} documents`);
    }

    console.log('\n🎉 Domain-specific question collections created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating domain collections:', error);
    process.exit(1);
  }
}

createDomainCollections();
