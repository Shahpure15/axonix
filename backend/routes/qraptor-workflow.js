/**
 * 🤖 Qraptor 2-Agent Workflow Routes
 * 
 * Handles the complete qRaptor integration workflow:
 * - Agent 1: Data Mapper & Store-er (collects MongoDB data)
 * - Agent 2: LLM Task Generator (generates + stores subtasks)
 * 
 * @author SocraticWingman Team
 * @version 2.0.0
 */

const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const QraptorWorkflowService = require('../services/QraptorWorkflowService');

const router = express.Router();

/**
 * @route   POST /api/qraptor/workflow/trigger
 * @desc    Trigger Agent 1 (Data Mapper) when user completes module
 * @access  Private (authenticated users)
 */
router.post('/workflow/trigger', authenticateToken, async (req, res) => {
  try {
    const { 
      userId, 
      domainId, 
      subdomainId, 
      moduleId,
      targetConfidence = 80,
      maxSubtasks = 5 
    } = req.body;

    console.log('🚀 Triggering Qraptor workflow for:', {
      userId,
      domainId, 
      subdomainId,
      moduleId
    });

    // Generate unique workflow tracking ID
    const workflowId = `workflow_${userId}_${domainId}_${subdomainId}_${Date.now()}`;

    // Start Agent 1: Data Mapper & Store-er
    const agent1Result = await QraptorWorkflowService.triggerAgent1DataMapper({
      workflowId,
      userId,
      domainId,
      subdomainId,
      moduleId,
      targetConfidence,
      maxSubtasks
    });

    res.status(200).json({
      success: true,
      message: 'Qraptor workflow initiated successfully',
      workflowId,
      agent1Status: agent1Result.status,
      nextStep: 'Agent 1 collecting and storing data, will trigger Agent 2 LLM',
      estimatedCompletion: '2-3 minutes'
    });

  } catch (error) {
    console.error('❌ Error triggering Qraptor workflow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger Qraptor workflow',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/qraptor/workflow/data-fetch
 * @desc    Endpoint for Agent 1 to fetch required data from our backend
 * @access  Qraptor Agent (with API key)
 */
router.post('/workflow/data-fetch', validateQraptorAgent, async (req, res) => {
  try {
    const { 
      workflowId,
      userId, 
      domainId, 
      subdomainId,
      targetConfidence,
      maxSubtasks 
    } = req.body;

    console.log('📊 Agent 1 requesting data for workflow:', workflowId);

    // Fetch all required data for LLM
    const llmData = await QraptorWorkflowService.fetchLLMRequiredData({
      userId,
      domainId,
      subdomainId,
      targetConfidence,
      maxSubtasks
    });

    res.status(200).json({
      success: true,
      workflowId,
      data: llmData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching data for Agent 1:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data for Agent 1',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/qraptor/workflow/store-subtask
 * @desc    Endpoint for Agent 2 (LLM) to store generated subtasks in MongoDB
 * @access  Qraptor Agent (with API key)
 */
router.post('/workflow/store-subtask', validateQraptorAgent, async (req, res) => {
  try {
    const {
      workflowId,
      userId,
      domainId,
      subdomainId,
      generatedSubtask,
      stopIfConfidenceMet
    } = req.body;

    console.log('🤖 Agent 2 storing generated subtask for workflow:', workflowId);

    // Store the LLM generated subtask directly in MongoDB
    const result = await QraptorWorkflowService.storeGeneratedSubtask({
      workflowId,
      userId,
      domainId,
      subdomainId,
      generatedSubtask,
      stopIfConfidenceMet
    });

    res.status(200).json({
      success: true,
      message: 'Subtask stored successfully in MongoDB',
      workflowId,
      subtaskId: result.subtaskId,
      subtaskCreated: result.subtaskCreated,
      nextAction: stopIfConfidenceMet ? 'Workflow complete - confidence target met' : 'Subtask ready for user'
    });

  } catch (error) {
    console.error('❌ Error storing subtask from Agent 2:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to store subtask from Agent 2',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qraptor/workflow/status/:workflowId
 * @desc    Check workflow status and progress
 * @access  Private (authenticated users)
 */
router.get('/workflow/status/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;

    const status = await QraptorWorkflowService.getWorkflowStatus(workflowId);

    res.status(200).json({
      success: true,
      workflowId,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting workflow status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workflow status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/qraptor/workflow/subtasks/:userId/:domainId/:subdomainId
 * @desc    Get generated subtasks for user
 * @access  Private (authenticated users)
 */
router.get('/workflow/subtasks/:userId/:domainId/:subdomainId', authenticateToken, async (req, res) => {
  try {
    const { userId, domainId, subdomainId } = req.params;
    const { status = 'active' } = req.query;

    const subtasks = await QraptorWorkflowService.getUserSubtasks({
      userId,
      domainId,
      subdomainId,
      status
    });

    res.status(200).json({
      success: true,
      subtasks,
      count: subtasks.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching user subtasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user subtasks',
      error: error.message
    });
  }
});

/**
 * Middleware to validate Qraptor agent access
 */
function validateQraptorAgent(req, res, next) {
  const apiKey = req.headers['x-qraptor-agent-key'];
  const expectedKey = process.env.QRAPTOR_AGENT_API_KEY;
  
  if (!apiKey || !expectedKey || apiKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing Qraptor agent API key'
    });
  }
  
  next();
}

module.exports = router;
