const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const aiOrchestrationService = require('../services/aiOrchestrationService');
const workflowExecutionService = require('../services/workflowExecutionService');
const connectorService = require('../services/connectorService');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

/**
 * @route   POST /api/v1/workflows/generate
 * @desc    Generate workflow from natural language and save it
 * @access  Private
 */
router.post('/generate', authenticate, validate(schemas.generateWorkflow), async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    // Get available connectors
    const connectors = await connectorService.getConnectors();
    
    // Generate workflow using AI
    const result = await aiOrchestrationService.generateWorkflow(prompt, connectors);
    
    // Extract workflow data and explicitly set status to active
    const { status: _ignoredStatus, ...workflowFields } = result.workflow;
    
    // Ensure trigger has required fields
    if (!workflowFields.trigger) {
      workflowFields.trigger = {
        id: 'trigger-1',
        type: 'trigger',
        connector: 'manual',
        config: { event: 'manual' },
      };
    } else {
      if (!workflowFields.trigger.id) workflowFields.trigger.id = 'trigger-1';
      if (!workflowFields.trigger.type) workflowFields.trigger.type = 'trigger';
      if (!workflowFields.trigger.connector) workflowFields.trigger.connector = 'manual';
      if (!workflowFields.trigger.config) workflowFields.trigger.config = { event: 'manual' };
    }
    
    // Normalize and fix steps structure
    if (workflowFields.steps && Array.isArray(workflowFields.steps)) {
      workflowFields.steps = workflowFields.steps.map((step, index) => {
        // Ensure step has required fields
        const normalizedStep = {
          id: step.id || `step-${index + 1}`,
          type: step.type || 'action',
          name: step.name || `Step ${index + 1}`,
          connector: step.connector ? step.connector.toLowerCase() : 'unknown',
          action: step.action || step.config?.action || getDefaultAction(step.connector),
          config: step.config || {},
        };
        
        // Ensure config has action field
        if (!normalizedStep.config.action) {
          normalizedStep.config.action = normalizedStep.action;
        }
        
        // Ensure config has parameters
        if (!normalizedStep.config.parameters) {
          normalizedStep.config.parameters = {};
        }
        
        return normalizedStep;
      });
    }
    
    // Save the generated workflow to database as active (ready to execute)
    const workflowData = {
      ...workflowFields,
      userId: req.userId,
      status: 'active', // Always set to active so it can be executed immediately
      metadata: {
        ...workflowFields.metadata,
        aiGenerated: true,
        generatedFrom: prompt,
        model: result.metadata.model,
        tokensUsed: result.metadata.tokensUsed,
      },
    };
    
    const workflow = new Workflow(workflowData);
    await workflow.save();
    
    res.json({
      success: true,
      message: 'Workflow generated and saved successfully',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to get default action for a connector
function getDefaultAction(connector) {
  const defaults = {
    github: 'get_issues',
    sendgrid: 'send_email',
    slack: 'send_message',
    airtable: 'get_records',
  };
  return defaults[connector?.toLowerCase()] || 'execute';
}

/**
 * @route   POST /api/v1/workflows
 * @desc    Create a new workflow
 * @access  Private
 */
router.post('/', authenticate, validate(schemas.createWorkflow), async (req, res, next) => {
  try {
    const workflowData = {
      ...req.body,
      userId: req.userId,
    };
    
    const workflow = new Workflow(workflowData);
    await workflow.save();
    
    res.status(201).json({
      success: true,
      message: 'Workflow created successfully',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/workflows
 * @desc    Get all workflows for user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit = 50, skip = 0, tags } = req.query;
    
    const query = { userId: req.userId, isDeleted: false };
    
    if (status) {
      query.status = status;
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    const workflows = await Workflow.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await Workflow.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        workflows,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/workflows/executions
 * @desc    Get all execution logs for user
 * @access  Private
 */
router.get('/executions', authenticate, async (req, res, next) => {
  try {
    const { limit = 10, skip = 0, status } = req.query;
    const ExecutionLog = require('../models/ExecutionLog');
    
    const query = { userId: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    const executions = await ExecutionLog.find(query)
      .populate('workflowId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    // Map field names to match frontend expectations
    const mappedExecutions = executions.map(exec => ({
      ...exec,
      workflow: exec.workflowId, // Map workflowId to workflow
      startedAt: exec.startTime,  // Map startTime to startedAt
    }));
    
    const total = await ExecutionLog.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        executions: mappedExecutions,
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/workflows/:id
 * @desc    Get workflow by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const workflow = await Workflow.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDeleted: false,
    });
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }
    
    res.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/workflows/:id
 * @desc    Update workflow
 * @access  Private
 */
router.put('/:id', authenticate, validate(schemas.updateWorkflow), async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        isDeleted: false,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow updated successfully',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/workflows/:id
 * @desc    Delete workflow (soft delete)
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/workflows/:id/execute
 * @desc    Execute workflow
 * @access  Private
 */
router.post('/:id/execute', authenticate, validate(schemas.executeWorkflow), async (req, res, next) => {
  try {
    const { triggerData } = req.body;
    
    const executionLog = await workflowExecutionService.executeWorkflow(
      req.params.id,
      triggerData,
      req.userId
    );
    
    res.json({
      success: true,
      message: 'Workflow execution started',
      data: executionLog,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/workflows/:id/executions
 * @desc    Get workflow execution logs
 * @access  Private
 */
router.get('/:id/executions', authenticate, async (req, res, next) => {
  try {
    const { limit = 50, skip = 0, status } = req.query;
    
    const result = await workflowExecutionService.getExecutionLogs(req.params.id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      status,
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/workflows/:id/stats
 * @desc    Get workflow execution statistics
 * @access  Private
 */
router.get('/:id/stats', authenticate, async (req, res, next) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const stats = await workflowExecutionService.getExecutionStats(
      req.params.id,
      timeRange
    );
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/workflows/:id/activate
 * @desc    Activate workflow
 * @access  Private
 */
router.post('/:id/activate', authenticate, async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        isDeleted: false,
      },
      { status: 'active' },
      { new: true }
    );
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow activated successfully',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/workflows/:id/pause
 * @desc    Pause workflow
 * @access  Private
 */
router.post('/:id/pause', authenticate, async (req, res, next) => {
  try {
    const workflow = await Workflow.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        isDeleted: false,
      },
      { status: 'paused' },
      { new: true }
    );
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Workflow paused successfully',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;

// Made with Bob
