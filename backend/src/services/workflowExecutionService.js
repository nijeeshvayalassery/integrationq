const Bull = require('bull');
const logger = require('../utils/logger');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const connectorService = require('./connectorService');
const aiOrchestrationService = require('./aiOrchestrationService');

class WorkflowExecutionService {
  constructor() {
    // Initialize Bull queue for async workflow execution
    this.executionQueue = new Bull('workflow-execution', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
      },
    });

    this._setupQueueProcessors();
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId, triggerData, userId) {
    try {
      const workflow = await Workflow.findById(workflowId);
      
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (workflow.status !== 'active') {
        throw new Error('Workflow is not active');
      }

      // Create execution log
      const executionLog = new ExecutionLog({
        workflowId,
        userId,
        status: 'running',
        startTime: new Date(),
        triggerData,
        steps: [],
      });
      await executionLog.save();

      // Add to queue for async processing
      await this.executionQueue.add(
        {
          workflowId,
          executionLogId: executionLog._id,
          triggerData,
          userId,
        },
        {
          attempts: workflow.settings.maxRetries || 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          timeout: workflow.settings.timeout || 30000,
        }
      );

      logger.info('Workflow execution queued', {
        workflowId,
        executionLogId: executionLog._id,
      });

      return executionLog;
    } catch (error) {
      logger.error('Error executing workflow', {
        workflowId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Setup queue processors
   */
  _setupQueueProcessors() {
    this.executionQueue.process(async (job) => {
      const { workflowId, executionLogId, triggerData, userId } = job.data;

      try {
        logger.info('Processing workflow execution', { workflowId, executionLogId });

        const workflow = await Workflow.findById(workflowId);
        const executionLog = await ExecutionLog.findById(executionLogId);

        // Execute workflow steps
        const result = await this._executeSteps(workflow, triggerData, executionLog);

        // Update execution log
        executionLog.status = 'success';
        executionLog.endTime = new Date();
        executionLog.calculateDuration();
        await executionLog.save();

        // Update workflow stats
        await workflow.recordExecution(true, executionLog.duration);

        logger.info('Workflow execution completed', {
          workflowId,
          executionLogId,
          duration: executionLog.duration,
        });

        return result;
      } catch (error) {
        logger.error('Workflow execution failed', {
          workflowId,
          executionLogId,
          error: error.message,
        });

        // Try to heal the workflow
        if (process.env.ENABLE_AI_HEALING === 'true') {
          await this._attemptHealing(workflowId, executionLogId, error);
        }

        // Update execution log
        const executionLog = await ExecutionLog.findById(executionLogId);
        executionLog.status = 'failed';
        executionLog.endTime = new Date();
        executionLog.error = {
          message: error.message,
          code: error.code,
          stack: error.stack,
        };
        executionLog.calculateDuration();
        await executionLog.save();

        // Update workflow stats
        const workflow = await Workflow.findById(workflowId);
        await workflow.recordExecution(false, executionLog.duration);

        throw error;
      }
    });

    // Queue event handlers
    this.executionQueue.on('completed', (job, result) => {
      logger.info('Job completed', { jobId: job.id });
    });

    this.executionQueue.on('failed', (job, err) => {
      logger.error('Job failed', { jobId: job.id, error: err.message });
    });
  }

  /**
   * Execute workflow steps sequentially
   */
  async _executeSteps(workflow, triggerData, executionLog) {
    let currentData = triggerData;
    const results = [];

    for (const step of workflow.steps) {
      const stepLog = {
        stepId: step.id,
        stepName: step.connector,
        status: 'running',
        startTime: new Date(),
        input: currentData,
      };

      try {
        logger.info('Executing step', { stepId: step.id, connector: step.connector });

        // Execute connector action
        const result = await connectorService.executeAction(
          step.connector,
          step.config,
          currentData
        );

        stepLog.status = 'success';
        stepLog.endTime = new Date();
        stepLog.duration = stepLog.endTime - stepLog.startTime;
        stepLog.output = result;

        currentData = result; // Pass output to next step
        results.push(result);

        logger.info('Step completed', {
          stepId: step.id,
          duration: stepLog.duration,
        });
      } catch (error) {
        stepLog.status = 'failed';
        stepLog.endTime = new Date();
        stepLog.duration = stepLog.endTime - stepLog.startTime;
        stepLog.error = {
          message: error.message,
          code: error.code,
          stack: error.stack,
        };

        executionLog.steps.push(stepLog);
        await executionLog.save();

        throw error;
      }

      executionLog.steps.push(stepLog);
      await executionLog.save();
    }

    return results;
  }

  /**
   * Attempt to heal workflow using AI
   */
  async _attemptHealing(workflowId, executionLogId, error) {
    try {
      logger.info('Attempting AI-powered healing', { workflowId, executionLogId });

      const workflow = await Workflow.findById(workflowId);
      const executionLog = await ExecutionLog.findById(executionLogId);

      // Analyze error with AI
      const analysis = await aiOrchestrationService.analyzeError(error, {
        workflow: workflow.toObject(),
        executionLog: executionLog.toObject(),
      });

      logger.info('Healing analysis completed', {
        strategy: analysis.healing_strategy,
        confidence: analysis.confidence,
      });

      // Apply healing strategy if confidence is high
      if (analysis.confidence > 0.7) {
        await this._applyHealingStrategy(
          workflow,
          executionLog,
          analysis.healing_strategy,
          analysis.implementation
        );

        executionLog.healingApplied = true;
        executionLog.healingDetails = {
          issue: analysis.root_cause,
          solution: analysis.solution,
          appliedAt: new Date(),
        };
        await executionLog.save();

        logger.info('Healing applied successfully', {
          workflowId,
          strategy: analysis.healing_strategy,
        });
      }
    } catch (healingError) {
      logger.error('Healing attempt failed', {
        workflowId,
        error: healingError.message,
      });
    }
  }

  /**
   * Apply healing strategy
   */
  async _applyHealingStrategy(workflow, executionLog, strategy, implementation) {
    switch (strategy) {
      case 'retry':
        // Increase retry count
        workflow.settings.maxRetries = Math.min(
          (workflow.settings.maxRetries || 3) + 1,
          10
        );
        break;

      case 'backoff':
        // Add exponential backoff
        workflow.settings.retryDelay = (workflow.settings.retryDelay || 1000) * 2;
        break;

      case 'circuit_breaker':
        // Temporarily pause workflow
        workflow.status = 'paused';
        break;

      case 'fallback':
        // Add fallback step
        // Implementation would add alternative steps
        break;

      case 'skip':
        // Mark step as optional
        // Implementation would modify step configuration
        break;

      default:
        logger.warn('Unknown healing strategy', { strategy });
    }

    await workflow.save();
  }

  /**
   * Get execution logs for a workflow
   */
  async getExecutionLogs(workflowId, options = {}) {
    const { limit = 50, skip = 0, status } = options;

    const query = { workflowId };
    if (status) {
      query.status = status;
    }

    const logs = await ExecutionLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await ExecutionLog.countDocuments(query);

    return {
      logs,
      total,
      limit,
      skip,
    };
  }

  /**
   * Get execution statistics
   */
  async getExecutionStats(workflowId, timeRange = '24h') {
    const now = new Date();
    let startTime;

    switch (timeRange) {
      case '1h':
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }

    const stats = await ExecutionLog.aggregate([
      {
        $match: {
          workflowId: workflowId,
          createdAt: { $gte: startTime },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
        },
      },
    ]);

    return stats;
  }
}

module.exports = new WorkflowExecutionService();

// Made with Bob
