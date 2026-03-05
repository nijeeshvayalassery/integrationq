const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['running', 'success', 'failed', 'timeout', 'cancelled'],
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number, // in milliseconds
    },
    triggerData: {
      type: mongoose.Schema.Types.Mixed,
    },
    steps: [
      {
        stepId: String,
        stepName: String,
        status: {
          type: String,
          enum: ['pending', 'running', 'success', 'failed', 'skipped'],
        },
        startTime: Date,
        endTime: Date,
        duration: Number,
        input: mongoose.Schema.Types.Mixed,
        output: mongoose.Schema.Types.Mixed,
        error: {
          message: String,
          code: String,
          stack: String,
        },
      },
    ],
    error: {
      message: String,
      code: String,
      stack: String,
      step: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    healingApplied: {
      type: Boolean,
      default: false,
    },
    healingDetails: {
      issue: String,
      solution: String,
      appliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
executionLogSchema.index({ workflowId: 1, createdAt: -1 });
executionLogSchema.index({ userId: 1, status: 1 });
executionLogSchema.index({ createdAt: -1 });

// TTL index to auto-delete old logs after 90 days
executionLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Method to calculate duration
executionLogSchema.methods.calculateDuration = function () {
  if (this.endTime && this.startTime) {
    this.duration = this.endTime - this.startTime;
  }
};

// Pre-save hook to calculate duration
executionLogSchema.pre('save', function (next) {
  if (this.endTime && this.startTime && !this.duration) {
    this.duration = this.endTime - this.startTime;
  }
  next();
});

const ExecutionLog = mongoose.model('ExecutionLog', executionLogSchema);

module.exports = ExecutionLog;

// Made with Bob
