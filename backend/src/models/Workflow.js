const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['trigger', 'action', 'condition', 'transform'],
  },
  connector: {
    type: String,
    required: true,
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  position: {
    x: Number,
    y: Number,
  },
  nextSteps: [String],
});

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'error'],
      default: 'draft',
    },
    steps: [workflowStepSchema],
    trigger: {
      type: workflowStepSchema,
      required: true,
    },
    naturalLanguagePrompt: {
      type: String,
    },
    aiGeneratedMetadata: {
      model: String,
      confidence: Number,
      generatedAt: Date,
    },
    executionStats: {
      totalExecutions: {
        type: Number,
        default: 0,
      },
      successfulExecutions: {
        type: Number,
        default: 0,
      },
      failedExecutions: {
        type: Number,
        default: 0,
      },
      lastExecutedAt: Date,
      averageExecutionTime: Number,
    },
    settings: {
      retryOnFailure: {
        type: Boolean,
        default: true,
      },
      maxRetries: {
        type: Number,
        default: 3,
      },
      timeout: {
        type: Number,
        default: 30000, // 30 seconds
      },
      enableLogging: {
        type: Boolean,
        default: true,
      },
    },
    tags: [String],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
workflowSchema.index({ userId: 1, status: 1 });
workflowSchema.index({ createdAt: -1 });
workflowSchema.index({ tags: 1 });

// Virtual for success rate
workflowSchema.virtual('successRate').get(function () {
  if (this.executionStats.totalExecutions === 0) return 0;
  return (
    (this.executionStats.successfulExecutions / this.executionStats.totalExecutions) * 100
  ).toFixed(2);
});

// Method to increment execution stats
workflowSchema.methods.recordExecution = async function (success, executionTime) {
  this.executionStats.totalExecutions += 1;
  if (success) {
    this.executionStats.successfulExecutions += 1;
  } else {
    this.executionStats.failedExecutions += 1;
  }
  this.executionStats.lastExecutedAt = new Date();
  
  // Calculate rolling average execution time
  if (this.executionStats.averageExecutionTime) {
    this.executionStats.averageExecutionTime =
      (this.executionStats.averageExecutionTime * (this.executionStats.totalExecutions - 1) +
        executionTime) /
      this.executionStats.totalExecutions;
  } else {
    this.executionStats.averageExecutionTime = executionTime;
  }
  
  await this.save();
};

// Ensure virtuals are included in JSON
workflowSchema.set('toJSON', { virtuals: true });
workflowSchema.set('toObject', { virtuals: true });

const Workflow = mongoose.model('Workflow', workflowSchema);

module.exports = Workflow;

// Made with Bob
