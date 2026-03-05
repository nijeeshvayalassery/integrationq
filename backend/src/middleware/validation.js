const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation failed', { errors, path: req.path });

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Validation schemas
 */
const schemas = {
  // Auth schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
  }),

  // Workflow schemas
  createWorkflow: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    naturalLanguagePrompt: Joi.string().max(1000),
    trigger: Joi.object({
      id: Joi.string().required(),
      type: Joi.string().valid('trigger').required(),
      connector: Joi.string().required(),
      config: Joi.object().required(),
    }).required(),
    steps: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('action', 'condition', 'transform').required(),
        connector: Joi.string().required(),
        config: Joi.object().required(),
        nextSteps: Joi.array().items(Joi.string()),
      })
    ),
    settings: Joi.object({
      retryOnFailure: Joi.boolean(),
      maxRetries: Joi.number().min(0).max(10),
      timeout: Joi.number().min(1000).max(300000),
      enableLogging: Joi.boolean(),
    }),
    tags: Joi.array().items(Joi.string()),
  }),

  updateWorkflow: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().max(500),
    status: Joi.string().valid('draft', 'active', 'paused', 'error'),
    steps: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('action', 'condition', 'transform').required(),
        connector: Joi.string().required(),
        config: Joi.object().required(),
        nextSteps: Joi.array().items(Joi.string()),
      })
    ),
    settings: Joi.object({
      retryOnFailure: Joi.boolean(),
      maxRetries: Joi.number().min(0).max(10),
      timeout: Joi.number().min(1000).max(300000),
      enableLogging: Joi.boolean(),
    }),
    tags: Joi.array().items(Joi.string()),
  }),

  generateWorkflow: Joi.object({
    prompt: Joi.string().min(10).max(1000).required(),
  }),

  // Connection schemas
  createConnection: Joi.object({
    connectorId: Joi.string().required(),
    name: Joi.string().min(3).max(100).required(),
    credentials: Joi.object().required(),
    metadata: Joi.object(),
  }),

  updateConnection: Joi.object({
    name: Joi.string().min(3).max(100),
    credentials: Joi.object(),
    metadata: Joi.object(),
  }),

  testConnection: Joi.object({
    connectorName: Joi.string().required(),
    credentials: Joi.object().required(),
  }),

  // Execution schemas
  executeWorkflow: Joi.object({
    triggerData: Joi.object(),
  }),
};

module.exports = {
  validate,
  schemas,
};

// Made with Bob
