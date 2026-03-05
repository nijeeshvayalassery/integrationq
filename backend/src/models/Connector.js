const mongoose = require('mongoose');

const connectorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Connector name is required'],
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['communication', 'database', 'storage', 'crm', 'development', 'productivity', 'other'],
    },
    icon: {
      type: String,
    },
    color: {
      type: String,
    },
    authType: {
      type: String,
      required: true,
      enum: ['oauth2', 'apiKey', 'basic', 'none'],
    },
    authConfig: {
      type: mongoose.Schema.Types.Mixed,
    },
    capabilities: {
      triggers: [
        {
          id: String,
          name: String,
          description: String,
          config: mongoose.Schema.Types.Mixed,
        },
      ],
      actions: [
        {
          id: String,
          name: String,
          description: String,
          config: mongoose.Schema.Types.Mixed,
        },
      ],
    },
    rateLimit: {
      requestsPerMinute: Number,
      requestsPerHour: Number,
      requestsPerDay: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: String,
      default: '1.0.0',
    },
    documentation: {
      url: String,
      setupGuide: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
connectorSchema.index({ name: 1 });
connectorSchema.index({ category: 1, isActive: 1 });

const Connector = mongoose.model('Connector', connectorSchema);

module.exports = Connector;

// Made with Bob
