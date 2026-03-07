const express = require('express');
const router = express.Router();
const Connector = require('../models/Connector');
const Connection = require('../models/Connection');
const connectorService = require('../services/connectorService');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

/**
 * @route   GET /api/v1/connectors
 * @desc    Get all available connectors
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const connectors = await connectorService.getConnectors({ category });
    
    res.json({
      success: true,
      data: connectors,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/connectors/:name
 * @desc    Get connector by name
 * @access  Private
 */
router.get('/:name', authenticate, async (req, res, next) => {
  try {
    const connector = await connectorService.getConnector(req.params.name);
    
    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'Connector not found',
      });
    }
    
    res.json({
      success: true,
      data: connector,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/connectors/test
 * @desc    Test connector connection
 * @access  Private
 */
router.post('/test', authenticate, validate(schemas.testConnection), async (req, res, next) => {
  try {
    const { connectorName, credentials } = req.body;
    
    const result = await connectorService.testConnection(connectorName, credentials);
    
    res.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/connectors/test-env/:name
 * @desc    Test connector connection using env credentials
 * @access  Private
 */
router.post('/test-env/:name', authenticate, async (req, res, next) => {
  try {
    const connectorName = req.params.name.toLowerCase();
    
    const result = await connectorService.testConnectionWithEnv(connectorName);
    
    res.json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/connectors/connections
 * @desc    Get all user connections
 * @access  Private
 */
router.get('/connections/all', authenticate, async (req, res, next) => {
  try {
    const connections = await Connection.find({
      userId: req.userId,
    })
      .populate('connectorId')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/connectors/connections
 * @desc    Create a new connection
 * @access  Private
 */
router.post('/connections', authenticate, validate(schemas.createConnection), async (req, res, next) => {
  try {
    const { connectorId, name, credentials, metadata } = req.body;
    
    // Verify connector exists
    const connector = await Connector.findById(connectorId);
    if (!connector) {
      return res.status(404).json({
        success: false,
        message: 'Connector not found',
      });
    }
    
    // Test connection before saving
    const testResult = await connectorService.testConnection(connector.name, credentials);
    
    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Connection test failed',
        error: testResult.message,
      });
    }
    
    // Create connection
    const connection = new Connection({
      userId: req.userId,
      connectorId,
      name,
      credentials,
      metadata,
      status: 'active',
      lastVerified: new Date(),
    });
    
    await connection.save();
    
    res.status(201).json({
      success: true,
      message: 'Connection created successfully',
      data: connection,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/connectors/connections/:id
 * @desc    Get connection by ID
 * @access  Private
 */
router.get('/connections/:id', authenticate, async (req, res, next) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('connectorId');
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }
    
    res.json({
      success: true,
      data: connection,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/connectors/connections/:id
 * @desc    Update connection
 * @access  Private
 */
router.put('/connections/:id', authenticate, validate(schemas.updateConnection), async (req, res, next) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('connectorId');
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }
    
    // If credentials are being updated, test the connection
    if (req.body.credentials) {
      const testResult = await connectorService.testConnection(
        connection.connectorId.name,
        req.body.credentials
      );
      
      if (!testResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Connection test failed',
          error: testResult.message,
        });
      }
      
      connection.lastVerified = new Date();
      connection.status = 'active';
    }
    
    // Update fields
    Object.keys(req.body).forEach((key) => {
      connection[key] = req.body[key];
    });
    
    await connection.save();
    
    res.json({
      success: true,
      message: 'Connection updated successfully',
      data: connection,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/connectors/connections/:id
 * @desc    Delete connection
 * @access  Private
 */
router.delete('/connections/:id', authenticate, async (req, res, next) => {
  try {
    const connection = await Connection.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Connection deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/connectors/connections/:id/verify
 * @desc    Verify connection
 * @access  Private
 */
router.post('/connections/:id/verify', authenticate, async (req, res, next) => {
  try {
    const connection = await Connection.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate('connectorId');
    
    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found',
      });
    }
    
    const credentials = connection.getDecryptedCredentials();
    const testResult = await connectorService.testConnection(
      connection.connectorId.name,
      credentials
    );
    
    if (testResult.success) {
      await connection.verify();
    } else {
      connection.status = 'error';
      await connection.save();
    }
    
    res.json({
      success: testResult.success,
      message: testResult.message,
      data: connection,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

// Made with Bob
