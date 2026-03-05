const mongoose = require('mongoose');
const crypto = require('crypto');

const connectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    connectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Connector',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    credentials: {
      type: String, // Encrypted credentials
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'error', 'revoked'],
      default: 'active',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    lastVerified: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and connector
connectionSchema.index({ userId: 1, connectorId: 1 });

// Encrypt credentials before saving
connectionSchema.pre('save', function (next) {
  if (!this.isModified('credentials')) return next();

  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(JSON.stringify(this.credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    this.credentials = iv.toString('hex') + ':' + encrypted;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt credentials
connectionSchema.methods.getDecryptedCredentials = function () {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    
    const parts = this.credentials.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt credentials');
  }
};

// Method to verify connection
connectionSchema.methods.verify = async function () {
  this.lastVerified = new Date();
  this.status = 'active';
  await this.save();
};

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;

// Made with Bob
