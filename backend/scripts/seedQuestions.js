/**
 * Data Seeding Script for SocraticWingman
 * Seeds sample questions for diagnostic tests
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');

// Load environment variables
dotenv.config();

// Sample questions for different domains
const sampleQuestions = [
  // Machine Learning Questions
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
    questionText: "Which algorithm is commonly used for classification problems?",
    questionType: "multiple-choice",
    options: [
      { text: "K-means", isCorrect: false },
      { text: "Random Forest", isCorrect: true },
      { text: "PCA", isCorrect: false },
      { text: "K-NN clustering", isCorrect: false }
    ],
    explanation: "Random Forest is a popular ensemble method used for both classification and regression tasks.",
    difficulty: "intermediate",
    domains: ["machine-learning"],
    tags: ["classification", "algorithms"],
    points: 2
  },

  // Data Science Questions
  {
    questionText: "What does 'pandas' library in Python primarily handle?",
    questionType: "multiple-choice",
    options: [
      { text: "Machine learning algorithms", isCorrect: false },
      { text: "Data manipulation and analysis", isCorrect: true },
      { text: "Web development", isCorrect: false },
      { text: "Image processing", isCorrect: false }
    ],
    explanation: "Pandas is a powerful data manipulation and analysis library for Python, providing data structures like DataFrames.",
    difficulty: "beginner",
    domains: ["data-science"],
    tags: ["pandas", "python", "data-manipulation"],
    points: 1
  },
  {
    questionText: "What is the purpose of data normalization?",
    questionType: "multiple-choice",
    options: [
      { text: "To remove duplicate records", isCorrect: false },
      { text: "To scale features to a similar range", isCorrect: true },
      { text: "To increase data volume", isCorrect: false },
      { text: "To encrypt sensitive data", isCorrect: false }
    ],
    explanation: "Data normalization scales numerical features to a similar range, preventing features with larger scales from dominating the analysis.",
    difficulty: "intermediate",
    domains: ["data-science"],
    tags: ["preprocessing", "normalization"],
    points: 2
  },

  // Web Development Questions
  {
    questionText: "What does HTML stand for?",
    questionType: "multiple-choice",
    options: [
      { text: "HyperText Markup Language", isCorrect: true },
      { text: "High Tech Modern Language", isCorrect: false },
      { text: "Home Tool Markup Language", isCorrect: false },
      { text: "Hyperlink and Text Markup Language", isCorrect: false }
    ],
    explanation: "HTML (HyperText Markup Language) is the standard markup language for creating web pages.",
    difficulty: "beginner",
    domains: ["web-development"],
    tags: ["html", "basics"],
    points: 1
  },
  {
    questionText: "Which HTTP method is typically used to update existing data?",
    questionType: "multiple-choice",
    options: [
      { text: "GET", isCorrect: false },
      { text: "POST", isCorrect: false },
      { text: "PUT", isCorrect: true },
      { text: "DELETE", isCorrect: false }
    ],
    explanation: "PUT is the standard HTTP method for updating existing resources, while POST is typically used for creating new resources.",
    difficulty: "intermediate",
    domains: ["web-development"],
    tags: ["http", "rest-api"],
    points: 2
  },

  // Mobile Development Questions
  {
    questionText: "What is React Native primarily used for?",
    questionType: "multiple-choice",
    options: [
      { text: "Web development", isCorrect: false },
      { text: "Cross-platform mobile app development", isCorrect: true },
      { text: "Desktop application development", isCorrect: false },
      { text: "Backend API development", isCorrect: false }
    ],
    explanation: "React Native allows developers to build mobile applications for both iOS and Android using a single codebase.",
    difficulty: "beginner",
    domains: ["mobile-development"],
    tags: ["react-native", "cross-platform"],
    points: 1
  },

  // DevOps Questions
  {
    questionText: "What is the primary purpose of Docker?",
    questionType: "multiple-choice",
    options: [
      { text: "Version control", isCorrect: false },
      { text: "Containerization", isCorrect: true },
      { text: "Database management", isCorrect: false },
      { text: "Load balancing", isCorrect: false }
    ],
    explanation: "Docker is a containerization platform that packages applications and their dependencies into lightweight, portable containers.",
    difficulty: "intermediate",
    domains: ["devops"],
    tags: ["docker", "containerization"],
    points: 2
  },

  // Cybersecurity Questions
  {
    questionText: "What does HTTPS provide that HTTP does not?",
    questionType: "multiple-choice",
    options: [
      { text: "Faster loading times", isCorrect: false },
      { text: "Better SEO ranking", isCorrect: false },
      { text: "Encrypted communication", isCorrect: true },
      { text: "Dynamic content support", isCorrect: false }
    ],
    explanation: "HTTPS provides encrypted communication between the client and server, ensuring data security and integrity.",
    difficulty: "beginner",
    domains: ["cybersecurity"],
    tags: ["https", "encryption"],
    points: 1
  },

  // UI/UX Design Questions
  {
    questionText: "What is the main principle behind responsive web design?",
    questionType: "multiple-choice",
    options: [
      { text: "Using only images for layout", isCorrect: false },
      { text: "Adapting layout to different screen sizes", isCorrect: true },
      { text: "Using fixed pixel dimensions", isCorrect: false },
      { text: "Avoiding CSS frameworks", isCorrect: false }
    ],
    explanation: "Responsive web design ensures that web pages adapt and display optimally across various devices and screen sizes.",
    difficulty: "beginner",
    domains: ["ui-ux-design"],
    tags: ["responsive", "design"],
    points: 1
  },

  // Cloud Computing Questions
  {
    questionText: "What is the main advantage of cloud computing?",
    questionType: "multiple-choice",
    options: [
      { text: "Requires more hardware", isCorrect: false },
      { text: "Scalability and cost-effectiveness", isCorrect: true },
      { text: "Slower deployment", isCorrect: false },
      { text: "Limited accessibility", isCorrect: false }
    ],
    explanation: "Cloud computing offers scalability, cost-effectiveness, and accessibility, allowing businesses to scale resources on-demand.",
    difficulty: "beginner",
    domains: ["cloud-computing"],
    tags: ["cloud", "scalability"],
    points: 1
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Seed the database
async function seedQuestions() {
  try {
    console.log('🌱 Starting to seed questions...');
    
    // Clear existing questions (optional)
    const existingCount = await Question.countDocuments();
    console.log(`📊 Found ${existingCount} existing questions`);
    
    if (existingCount === 0) {
      // Insert sample questions
      const insertedQuestions = await Question.insertMany(sampleQuestions);
      console.log(`✅ Successfully seeded ${insertedQuestions.length} questions`);
      
      // Show summary by domain
      const domainCounts = {};
      insertedQuestions.forEach(q => {
        q.domains.forEach(domain => {
          domainCounts[domain] = (domainCounts[domain] || 0) + 1;
        });
      });
      
      console.log('📈 Questions by domain:');
      Object.entries(domainCounts).forEach(([domain, count]) => {
        console.log(`  ${domain}: ${count} questions`);
      });
    } else {
      console.log('📝 Questions already exist. Skipping seeding.');
    }
    
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
  }
}

// Main function
async function main() {
  await connectDB();
  await seedQuestions();
  
  console.log('🎉 Seeding completed!');
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { sampleQuestions, seedQuestions };
