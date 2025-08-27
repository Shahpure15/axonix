/**
 * Simple Test API Endpoint
 * Use this to check if backend is responding to POST requests
 */

const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/test/ping
 * @desc    Simple test endpoint to check backend connectivity
 * @access  Public
 */
router.post('/ping', (req, res) => {
  console.log('🔥 Backend POST API Hit Successfully!');
  console.log('📨 Request Body:', req.body);
  console.log('📅 Timestamp:', new Date().toISOString());
  
  res.status(200).json({
    success: true,
    message: 'Backend is working! POST request received successfully.',
    timestamp: new Date().toISOString(),
    requestData: req.body,
    serverInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
  });
});

/**
 * @route   POST /api/test/ai-simulation
 * @desc    Simulate AI test generation response
 * @access  Public
 */
router.post('/ai-simulation', (req, res) => {
  console.log('🤖 AI Simulation API Hit!');
  console.log('📨 Request:', req.body);
  
  // Simulate AI response delay
  setTimeout(() => {
    res.status(200).json({
      success: true,
      message: "AI test generated successfully (simulated)",
      data: {
        testId: `test_${Date.now()}`,
        domain: req.body.domain || "cpp",
        testType: req.body.testType || "review",
        questions: [
          {
            _id: "q1",
            questionText: "What is the time complexity of binary search?",
            questionType: "multiple-choice",
            options: [
              { text: "O(n)" },
              { text: "O(log n)" },
              { text: "O(n²)" },
              { text: "O(1)" }
            ],
            difficulty: "intermediate",
            points: 10,
            topic: "Algorithm Complexity",
            aiReason: "Testing algorithm knowledge"
          }
        ],
        metadata: {
          totalQuestions: 1,
          estimatedDuration: 5,
          timeLimit: 300
        }
      }
    });
  }, 2000); // 2 second delay to simulate AI processing
});

module.exports = router;
