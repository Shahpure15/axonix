/**
 * Qraptor 3-Agent Workflow Service
 * Handles the complete workflow: Data Mapping → LLM Processing → Result Storage
 */

const axios = require('axios');
const User = require('../models/User');
const LearningProgress = require('../models/LearningProgress');
const TestSession = require('../models/TestSession');
const UserPerformanceAnalytics = require('../models/UserPerformanceAnalytics');
const QraptorSubtask = require('../models/QraptorSubtask');

class QraptorWorkflowService {
  
  /**
   * Agent 1: Data Mapper & Store-er
   * Fetches data from MongoDB and triggers qRaptor Agent 1
   */
  static async triggerAgent1DataMapper({
    workflowId,
    userId,
    domainId,
    subdomainId,
    moduleId,
    targetConfidence,
    maxSubtasks
  }) {
    try {
      console.log('🔄 Agent 1: Starting data mapping for workflow:', workflowId);

      // Create workflow tracking record
      await this.createWorkflowRecord({
        workflowId,
        userId,
        domainId,
        subdomainId,
        status: 'agent1_initiated',
        stage: 'data_mapping'
      });

      // Trigger qRaptor Agent 1 (Data Mapper)
      const qraptorAgent1Url = `${process.env.QRAPTOR_BASE_URL}/agent1/trigger`;
      
      const agent1Payload = {
        workflowId,
        userId,
        domainId,
        subdomainId,
        moduleId,
        targetConfidence,
        maxSubtasks,
        dataFetchEndpoint: `${process.env.BACKEND_BASE_URL}/api/qraptor/workflow/data-fetch`,
        llmTriggerEndpoint: `${process.env.QRAPTOR_BASE_URL}/agent2/trigger`
      };

      const response = await axios.post(qraptorAgent1Url, agent1Payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Qraptor-API-Key': process.env.QRAPTOR_API_KEY
        }
      });

      console.log('✅ Agent 1 triggered successfully:', response.data);

      return {
        status: 'success',
        agent1Response: response.data,
        workflowId
      };

    } catch (error) {
      console.error('❌ Error triggering Agent 1:', error);
      
      // Update workflow status to failed
      await this.updateWorkflowStatus(workflowId, 'agent1_failed', {
        error: error.message,
        stage: 'data_mapping'
      });

      throw error;
    }
  }

  /**
   * Fetch all required data for LLM Agent 2
   * This is called by qRaptor Agent 1 to get data from our MongoDB
   */
  static async fetchLLMRequiredData({
    userId,
    domainId,
    subdomainId,
    targetConfidence,
    maxSubtasks
  }) {
    try {
      console.log('📊 Fetching LLM required data for:', { userId, domainId, subdomainId });

      // 1. Get user progress (equivalent to SQL query in your example)
      const userProgress = await this.getUserProgress(userId, domainId, subdomainId);

      // 2. Get domain/subdomain info and skills
      const subdomainInfo = await this.getSubdomainInfo(domainId, subdomainId);

      // 3. Get task templates for this domain/subdomain
      const taskTemplates = await this.getTaskTemplates(domainId, subdomainId);

      // 4. Get recent attempts/test sessions
      const recentAttempts = await this.getRecentAttempts(userId, domainId, subdomainId);

      // 5. Get existing subtasks count (to check max_subtasks limit)
      const existingSubtasksCount = await this.getExistingSubtasksCount(userId, domainId, subdomainId);

      const llmData = {
        // Core data for LLM prompt
        user_progress_result: [userProgress],
        domain_id: domainId,
        subdomain_id: subdomainId,
        subdomain_info: [subdomainInfo],
        task_templates_list: taskTemplates,
        attempts_list: recentAttempts,
        target_confidence: targetConfidence,
        max_subtasks: maxSubtasks,
        existing_subtasks_count: existingSubtasksCount,
        
        // Additional context
        user_id: userId,
        sys_subscription_id: process.env.SUBSCRIPTION_ID || 'default',
        
        // Metadata
        timestamp: new Date().toISOString(),
        data_source: 'mongodb_socratic_wingman'
      };

      console.log('✅ LLM data prepared successfully:', {
        userProgressFound: !!userProgress,
        subdomainInfoFound: !!subdomainInfo,
        taskTemplatesCount: taskTemplates.length,
        recentAttemptsCount: recentAttempts.length,
        existingSubtasksCount
      });

      return llmData;

    } catch (error) {
      console.error('❌ Error fetching LLM required data:', error);
      throw error;
    }
  }

  /**
   * Store generated subtask from Agent 2 (LLM) directly in MongoDB
   * Called when Agent 2 generates subtask and simultaneously stores in Data Vault + MongoDB
   */
  static async storeGeneratedSubtask({
    workflowId,
    userId,
    domainId,
    subdomainId,
    generatedSubtask,
    stopIfConfidenceMet
  }) {
    try {
      console.log('🤖 Storing generated subtask from Agent 2 for workflow:', workflowId);

      // Update workflow status to Agent 2 completed
      await this.updateWorkflowStatus(workflowId, 'agent2_completed', {
        stage: 'subtask_generation_complete',
        stopIfConfidenceMet
      });

      let subtaskCreated = false;
      let subtaskId = null;

      // If confidence target met, no subtasks needed
      if (stopIfConfidenceMet) {
        console.log('🎯 Confidence target met, no subtasks needed');
        
        await this.updateWorkflowStatus(workflowId, 'completed_confidence_met', {
          stage: 'workflow_complete',
          reason: 'confidence_target_achieved'
        });

        return {
          subtaskCreated: false,
          subtaskId: null,
          message: 'Confidence target met, no additional subtasks needed'
        };
      }

      // Store the generated subtask in MongoDB
      if (generatedSubtask && generatedSubtask.task) {
        const subtask = await this.createSubtaskFromLLM({
          workflowId,
          userId,
          domainId,
          subdomainId,
          taskData: generatedSubtask.task
        });

        subtaskCreated = true;
        subtaskId = subtask._id;

        console.log('✅ Subtask stored in MongoDB:', subtask.taskId);
      }

      // Update workflow to completed
      await this.updateWorkflowStatus(workflowId, 'completed_subtasks_created', {
        stage: 'workflow_complete',
        subtaskCreated,
        subtaskId
      });

      return {
        subtaskCreated,
        subtaskId,
        message: subtaskCreated ? 'Subtask successfully stored in MongoDB' : 'No subtask generated'
      };

    } catch (error) {
      console.error('❌ Error storing generated subtask:', error);
      
      await this.updateWorkflowStatus(workflowId, 'agent2_failed', {
        error: error.message,
        stage: 'subtask_storage_failed'
      });

      throw error;
    }
  }

  /**
   * Get user progress data (equivalent to your SQL query)
   */
  static async getUserProgress(userId, domainId, subdomainId) {
    try {
      const learningProgress = await LearningProgress.findOne({ userId });
      
      if (!learningProgress) {
        return {
          id: null,
          user_id: userId,
          domain_id: domainId,
          subdomain_id: subdomainId,
          confidence: 0,
          status: 'not_started',
          last_task_id: null,
          history: []
        };
      }

      // Find specific domain progress
      const domainProgress = learningProgress.domains.find(d => d.domain === domainId);
      
      return {
        id: learningProgress._id,
        user_id: userId,
        domain_id: domainId,
        subdomain_id: subdomainId,
        confidence: domainProgress?.confidence || 0,
        status: domainProgress?.status || 'not_started',
        last_task_id: domainProgress?.lastTaskId || null,
        history: domainProgress?.testHistory || []
      };

    } catch (error) {
      console.error('❌ Error getting user progress:', error);
      throw error;
    }
  }

  /**
   * Get subdomain information and skills
   */
  static async getSubdomainInfo(domainId, subdomainId) {
    try {
      // This would typically come from a curriculum/content database
      // For now, using hardcoded data structure
      const subdomainSkills = {
        mathematics: {
          algebra: {
            skills: "linear equations, quadratic equations, polynomial operations, factoring, solving systems of equations, graphing linear functions, substitution method, elimination method, word problems, algebraic manipulation",
            description: "Fundamental algebraic concepts and problem-solving techniques",
            difficulty_levels: ["beginner", "intermediate", "advanced"]
          },
          geometry: {
            skills: "area calculations, perimeter, volume, surface area, angle relationships, triangle properties, circle properties, coordinate geometry, transformations",
            description: "Spatial reasoning and geometric problem solving",
            difficulty_levels: ["beginner", "intermediate", "advanced"]
          }
        },
        science: {
          physics: {
            skills: "motion, forces, energy, momentum, waves, electricity, magnetism, thermodynamics, optics",
            description: "Understanding physical phenomena and scientific principles",
            difficulty_levels: ["beginner", "intermediate", "advanced"]
          }
        }
      };

      const skills = subdomainSkills[domainId]?.[subdomainId]?.skills || "general problem solving, critical thinking, analytical reasoning";
      
      return {
        domain_id: domainId,
        subdomain_id: subdomainId,
        skills,
        description: subdomainSkills[domainId]?.[subdomainId]?.description || "General learning concepts",
        difficulty_levels: subdomainSkills[domainId]?.[subdomainId]?.difficulty_levels || ["beginner", "intermediate", "advanced"]
      };

    } catch (error) {
      console.error('❌ Error getting subdomain info:', error);
      throw error;
    }
  }

  /**
   * Get task templates for the domain/subdomain
   */
  static async getTaskTemplates(domainId, subdomainId) {
    try {
      // Basic task templates structure
      const templates = [
        {
          template_id: `${domainId}_${subdomainId}_basic`,
          type: "problem_solving",
          difficulty: "beginner",
          format: "multiple_choice",
          estimated_minutes: 5
        },
        {
          template_id: `${domainId}_${subdomainId}_intermediate`,
          type: "application",
          difficulty: "intermediate", 
          format: "short_answer",
          estimated_minutes: 10
        },
        {
          template_id: `${domainId}_${subdomainId}_advanced`,
          type: "analysis",
          difficulty: "advanced",
          format: "extended_response",
          estimated_minutes: 15
        }
      ];

      return templates;

    } catch (error) {
      console.error('❌ Error getting task templates:', error);
      return [];
    }
  }

  /**
   * Get recent attempts/test sessions
   */
  static async getRecentAttempts(userId, domainId, subdomainId, limit = 10) {
    try {
      const testSessions = await TestSession.find({
        userId,
        domain: domainId,
        status: 'completed'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

      return testSessions.map(session => ({
        attempt_id: session._id,
        user_id: userId,
        domain_id: domainId,
        subdomain_id: subdomainId,
        score: session.score,
        percentage: session.percentage,
        questions_attempted: session.totalQuestions,
        questions_correct: Math.round((session.percentage / 100) * session.totalQuestions),
        time_spent: session.totalTimeSpent,
        mistakes: session.questions?.filter(q => !q.correct).map(q => ({
          question_id: q.questionId,
          skill: q.skill || 'general',
          mistake_type: q.mistakeType || 'incorrect_answer'
        })) || [],
        completed_at: session.completedAt
      }));

    } catch (error) {
      console.error('❌ Error getting recent attempts:', error);
      return [];
    }
  }

  /**
   * Get existing subtasks count to check limits
   */
  static async getExistingSubtasksCount(userId, domainId, subdomainId) {
    try {
      const count = await QraptorSubtask.countDocuments({
        userId,
        domainId,
        subdomainId,
        status: { $in: ['active', 'pending'] }
      });

      return count;

    } catch (error) {
      console.error('❌ Error getting existing subtasks count:', error);
      return 0;
    }
  }

  /**
   * Create a new subtask from LLM generated data
   */
  static async createSubtaskFromLLM({
    workflowId,
    userId,
    domainId,
    subdomainId,
    taskData
  }) {
    try {
      const subtask = new QraptorSubtask({
        workflowId,
        userId,
        domainId,
        subdomainId,
        taskId: taskData.task_id,
        prompt: taskData.prompt,
        inputsSchema: taskData.inputs_schema,
        answerSchema: taskData.answer_schema,
        difficulty: taskData.difficulty,
        estimatedMinutes: taskData.estimated_minutes,
        skillsTargeted: taskData.skills_targeted,
        maxAttempts: taskData.max_attempts,
        status: 'active',
        createdAt: new Date(),
        metadata: {
          generatedBy: 'qraptor_agent2_llm',
          workflowId,
          storedSimultaneously: true, // Flag indicating simultaneous storage
          dataVaultStored: true
        }
      });

      await subtask.save();
      console.log('✅ Subtask created in MongoDB by Agent 2:', subtask.taskId);

      return subtask;

    } catch (error) {
      console.error('❌ Error creating subtask from LLM:', error);
      throw error;
    }
  }

  /**
   * Create workflow tracking record
   */
  static async createWorkflowRecord({
    workflowId,
    userId,
    domainId,
    subdomainId,
    status,
    stage
  }) {
    try {
      // Using QraptorSubtask collection to also track workflows
      const workflowRecord = new QraptorSubtask({
        workflowId,
        userId,
        domainId,
        subdomainId,
        taskId: `workflow_${workflowId}`,
        status: 'workflow_tracking',
        workflowStatus: status,
        workflowStage: stage,
        createdAt: new Date(),
        metadata: {
          type: 'workflow_tracking',
          workflowId
        }
      });

      await workflowRecord.save();
      return workflowRecord;

    } catch (error) {
      console.error('❌ Error creating workflow record:', error);
      throw error;
    }
  }

  /**
   * Update workflow status
   */
  static async updateWorkflowStatus(workflowId, status, additionalData = {}) {
    try {
      await QraptorSubtask.updateOne(
        { workflowId, taskId: `workflow_${workflowId}` },
        {
          $set: {
            workflowStatus: status,
            workflowStage: additionalData.stage || 'unknown',
            updatedAt: new Date(),
            ...additionalData
          }
        }
      );

      console.log(`📊 Workflow ${workflowId} status updated to:`, status);

    } catch (error) {
      console.error('❌ Error updating workflow status:', error);
    }
  }

  /**
   * Get workflow status
   */
  static async getWorkflowStatus(workflowId) {
    try {
      const workflowRecord = await QraptorSubtask.findOne({
        workflowId,
        taskId: `workflow_${workflowId}`
      }).lean();

      if (!workflowRecord) {
        return { status: 'not_found' };
      }

      return {
        workflowId,
        status: workflowRecord.workflowStatus,
        stage: workflowRecord.workflowStage,
        createdAt: workflowRecord.createdAt,
        updatedAt: workflowRecord.updatedAt,
        metadata: workflowRecord.metadata
      };

    } catch (error) {
      console.error('❌ Error getting workflow status:', error);
      throw error;
    }
  }

  /**
   * Get user subtasks
   */
  static async getUserSubtasks({
    userId,
    domainId,
    subdomainId,
    status = 'active'
  }) {
    try {
      const subtasks = await QraptorSubtask.find({
        userId,
        domainId,
        subdomainId,
        status,
        taskId: { $not: /^workflow_/ } // Exclude workflow tracking records
      })
      .sort({ createdAt: -1 })
      .lean();

      return subtasks;

    } catch (error) {
      console.error('❌ Error getting user subtasks:', error);
      throw error;
    }
  }

}

module.exports = QraptorWorkflowService;
