// Dual AI Provider: AWS Bedrock (primary) + Groq (fallback)
const Groq = require('groq-sdk');

class AIProvider {
  constructor(config = {}) {
    this.provider = config.provider || process.env.AI_PROVIDER || 'groq';
    this.groqApiKey = config.groqApiKey || process.env.GROQ_API_KEY;
    
    // Initialize Groq
    if (this.groqApiKey) {
      this.groq = new Groq({ apiKey: this.groqApiKey });
    }
    
    // Initialize Bedrock (lazy load)
    this.bedrock = null;
    this.bedrockRegion = config.bedrockRegion || process.env.AWS_REGION || 'us-east-1';
    
    console.log(`✅ AI Provider initialized: ${this.provider.toUpperCase()}`);
  }

  async initBedrock() {
    if (this.bedrock) return;
    
    try {
      const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
      this.bedrock = new BedrockRuntimeClient({ region: this.bedrockRegion });
      this.InvokeModelCommand = InvokeModelCommand;
      console.log(`✅ AWS Bedrock initialized (${this.bedrockRegion})`);
    } catch (error) {
      console.warn('⚠️  AWS Bedrock SDK not available:', error.message);
      throw error;
    }
  }

  async generateCompletion(prompt, options = {}) {
    const maxRetries = options.maxRetries || 2;
    let lastError;

    // Try primary provider
    try {
      if (this.provider === 'bedrock') {
        return await this.generateWithBedrock(prompt, options);
      } else {
        return await this.generateWithGroq(prompt, options);
      }
    } catch (error) {
      console.warn(`⚠️  ${this.provider} failed:`, error.message);
      lastError = error;
    }

    // Fallback to alternative provider
    try {
      const fallbackProvider = this.provider === 'bedrock' ? 'groq' : 'bedrock';
      console.log(`🔄 Falling back to ${fallbackProvider}...`);
      
      if (fallbackProvider === 'bedrock') {
        return await this.generateWithBedrock(prompt, options);
      } else {
        return await this.generateWithGroq(prompt, options);
      }
    } catch (fallbackError) {
      console.error(`❌ Both providers failed`);
      throw new Error(`AI generation failed: ${lastError.message} | Fallback: ${fallbackError.message}`);
    }
  }

  async generateWithGroq(prompt, options = {}) {
    if (!this.groq) {
      throw new Error('Groq API key not configured');
    }

    const model = options.model || 'llama-3.3-70b-versatile';
    const temperature = options.temperature || 0.3;
    const maxTokens = options.maxTokens || 2000;

    const response = await this.groq.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: temperature,
      max_tokens: maxTokens,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined
    });

    return {
      content: response.choices[0].message.content,
      provider: 'groq',
      model: model,
      usage: {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      }
    };
  }

  async generateWithBedrock(prompt, options = {}) {
    await this.initBedrock();

    const modelId = options.model || 'anthropic.claude-3-sonnet-20240229-v1:0';
    const temperature = options.temperature || 0.3;
    const maxTokens = options.maxTokens || 2000;

    // Format request for Claude
    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    const command = new this.InvokeModelCommand({
      modelId: modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    const response = await this.bedrock.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return {
      content: responseBody.content[0].text,
      provider: 'bedrock',
      model: modelId,
      usage: {
        inputTokens: responseBody.usage.input_tokens,
        outputTokens: responseBody.usage.output_tokens,
        totalTokens: responseBody.usage.input_tokens + responseBody.usage.output_tokens
      }
    };
  }

  // Batch generation for multiple prompts
  async generateBatch(prompts, options = {}) {
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const result = await this.generateCompletion(prompt, options);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get provider info
  getProviderInfo() {
    return {
      primary: this.provider,
      fallback: this.provider === 'bedrock' ? 'groq' : 'bedrock',
      groqAvailable: !!this.groq,
      bedrockAvailable: !!this.bedrock,
      region: this.bedrockRegion
    };
  }
}

module.exports = AIProvider;
