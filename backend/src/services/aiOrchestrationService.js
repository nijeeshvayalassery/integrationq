const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIOrchestrationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
  }

  /**
   * Convert natural language prompt to workflow definition
   */
  async generateWorkflow(prompt, availableConnectors) {
    try {
      logger.info('Generating workflow from prompt', { prompt });

      const systemPrompt = this._buildSystemPrompt(availableConnectors);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0].message.content;
      const workflowDefinition = JSON.parse(response);

      logger.info('Workflow generated successfully', {
        workflowName: workflowDefinition.name,
        stepsCount: workflowDefinition.steps?.length || 0,
      });

      return {
        workflow: workflowDefinition,
        metadata: {
          model: this.model,
          confidence: this._calculateConfidence(completion),
          generatedAt: new Date(),
          tokensUsed: completion.usage.total_tokens,
        },
      };
    } catch (error) {
      logger.error('Error generating workflow', { error: error.message });
      throw new Error(`Failed to generate workflow: ${error.message}`);
    }
  }

  /**
   * Analyze workflow execution error and suggest fixes
   */
  async analyzeError(error, workflowContext) {
    try {
      logger.info('Analyzing error for healing', { error: error.message });

      const prompt = `
Analyze this integration workflow error and suggest a fix:

Error: ${error.message}
Error Code: ${error.code || 'N/A'}
Workflow Context: ${JSON.stringify(workflowContext, null, 2)}

Provide a JSON response with:
1. root_cause: Brief explanation of the issue
2. solution: Specific fix to apply
3. healing_strategy: One of [retry, backoff, circuit_breaker, fallback, skip]
4. confidence: Number between 0-1
5. implementation: Code or configuration changes needed
`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in debugging integration workflows and API errors.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      logger.info('Error analysis completed', {
        rootCause: analysis.root_cause,
        strategy: analysis.healing_strategy,
      });

      return analysis;
    } catch (error) {
      logger.error('Error analyzing workflow error', { error: error.message });
      throw new Error(`Failed to analyze error: ${error.message}`);
    }
  }

  /**
   * Optimize workflow based on execution history
   */
  async optimizeWorkflow(workflow, executionHistory) {
    try {
      logger.info('Optimizing workflow', { workflowId: workflow._id });

      const prompt = `
Analyze this workflow and its execution history to suggest optimizations:

Workflow: ${JSON.stringify(workflow, null, 2)}
Execution History: ${JSON.stringify(executionHistory, null, 2)}

Suggest optimizations for:
1. Performance improvements
2. Error handling
3. Resource usage
4. Reliability

Provide JSON response with optimization suggestions.
`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert in optimizing integration workflows.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      });

      const optimizations = JSON.parse(completion.choices[0].message.content);

      logger.info('Workflow optimization completed', {
        suggestionsCount: optimizations.suggestions?.length || 0,
      });

      return optimizations;
    } catch (error) {
      logger.error('Error optimizing workflow', { error: error.message });
      throw new Error(`Failed to optimize workflow: ${error.message}`);
    }
  }

  /**
   * Build system prompt with available connectors
   */
  _buildSystemPrompt(connectors) {
    const connectorsList = connectors
      .map(
        (c) =>
          `- ${c.displayName} (${c.name}): ${c.description}\n  Triggers: ${c.capabilities.triggers.map((t) => t.name).join(', ')}\n  Actions: ${c.capabilities.actions.map((a) => a.name).join(', ')}`
      )
      .join('\n');

    return `You are an AI assistant that converts natural language descriptions into executable integration workflows.

Available Connectors:
${connectorsList}

Your task is to analyze the user's request and generate a workflow definition in JSON format with this structure:

{
  "name": "Workflow Name",
  "description": "Brief description",
  "trigger": {
    "id": "trigger-1",
    "type": "trigger",
    "connector": "connector-name",
    "config": {
      "event": "event-type",
      "filters": {}
    }
  },
  "steps": [
    {
      "id": "step-1",
      "type": "action",
      "connector": "connector-name",
      "config": {
        "action": "action-name",
        "parameters": {}
      },
      "nextSteps": ["step-2"]
    }
  ]
}

Rules:
1. Use only the available connectors listed above
2. Ensure logical flow between steps
3. Include proper error handling
4. Add appropriate filters and conditions
5. Use realistic configuration values
6. Return valid JSON only`;
  }

  /**
   * Calculate confidence score from OpenAI response
   */
  _calculateConfidence(completion) {
    // Simple heuristic based on finish_reason and token usage
    if (completion.choices[0].finish_reason === 'stop') {
      const tokensUsed = completion.usage.total_tokens;
      const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 2000;
      
      // Higher confidence if we didn't hit token limit
      if (tokensUsed < maxTokens * 0.9) {
        return 0.95;
      }
      return 0.85;
    }
    return 0.7;
  }

  /**
   * Validate generated workflow
   */
  validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!workflow.trigger) {
      errors.push('Workflow must have a trigger');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate step references
    const stepIds = new Set(workflow.steps.map((s) => s.id));
    workflow.steps.forEach((step) => {
      if (step.nextSteps) {
        step.nextSteps.forEach((nextId) => {
          if (!stepIds.has(nextId)) {
            errors.push(`Invalid step reference: ${nextId}`);
          }
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = new AIOrchestrationService();

// Made with Bob
