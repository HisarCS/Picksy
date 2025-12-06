/**
 * AI Service - Handles AI model initialization and response generation
 * Now with Hugging Face API integration
 */
class AIService {
  constructor() {
    this.isReady = false;
    this.isLoading = false;
    this.onProgressCallback = null;
    this.huggingFaceApiKey = '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';
    this.huggingFaceModel = 'microsoft/DialoGPT-medium'; // Kid-friendly conversational model
    this.apiUrl = 'https://api-inference.huggingface.co/models';
  }

  /**
   * Initialize AI models
   * @returns {Promise<boolean>}
   */
  async initModels() {
    this.isLoading = true;
    
    try {
      // Check if we have Hugging Face API key
      if (this.huggingFaceApiKey) {
        console.log("Hugging Face API configured, ready to use");
        this.isReady = true;
        this.isLoading = false;
        return true;
      } else if (window.picksyAI && typeof window.picksyAI.initModels === 'function') {
        console.log("PicksyAI found, initializing models...");
        
        if (window.picksyAI.onProgress && this.onProgressCallback) {
          window.picksyAI.onProgress = this.onProgressCallback;
        }
        
        const result = await window.picksyAI.initModels();
        this.isReady = result;
        this.isLoading = false;
        return result;
      } else {
        console.warn('No AI service available, using fallback');
        this.createFallback();
        this.isLoading = false;
        return false;
      }
    } catch (error) {
      console.error("Error initializing models:", error);
      this.createFallback();
      this.isLoading = false;
      return false;
    }
  }

  /**
   * Create fallback AI implementation
   */
  createFallback() {
    if (!window.picksyAI) {
      window.picksyAI = {
        generateResponse: (input) => Promise.resolve(this.getQuickResponse(input)),
        initModels: () => Promise.resolve(false),
        isReady: false,
        isLoading: false
      };
    }
  }

  /**
   * Generate AI response
   * @param {string} input - User input
   * @param {Array} conversationHistory - Previous messages for context
   * @returns {Promise<string>}
   */
  async generateResponse(input, conversationHistory = []) {
    try {
      // Try Hugging Face API first
      if (this.huggingFaceApiKey) {
        const prompt = this.buildChatPrompt(input, conversationHistory);
        const response = await this.generateWithHuggingFace(prompt);
        // If response is empty or too short, fall back
        if (!response || response.trim().length < 3) {
          console.warn("Empty or invalid response from API, using fallback");
          return this.getQuickResponse(input);
        }
        return response;
      } else if (window.picksyAI && window.picksyAI.generateResponse) {
        return await window.picksyAI.generateResponse(input);
      } else {
        return this.getQuickResponse(input);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      console.error("Error details:", error.message);
      // Use fallback but log the error for debugging
      return this.getQuickResponse(input);
    }
  }

  /**
   * Build prompt for casual chat with conversation history
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @returns {string}
   */
  buildChatPrompt(userMessage, conversationHistory = []) {
    const recentHistory = conversationHistory.slice(-6);
    
    let prompt = '';
    
    // Detect if this is a music-related conversation
    const conversationContext = this.detectConversationContext(userMessage, recentHistory);
    
    if (recentHistory.length === 0) {
      // First message - adapt to topic
      if (conversationContext === 'music') {
        prompt = `You are Picksy, a friendly music teacher.\n\n`;
      } else {
        prompt = `You are Picksy, a friendly and helpful assistant for kids.\n\n`;
      }
    }
    
    // Natural conversation flow
    recentHistory.forEach(msg => {
      prompt += `${msg.type === 'user' ? 'User' : 'Picksy'}: ${msg.text}\n`;
    });
    
    prompt += `User: ${userMessage}\nPicksy:`;
    
    return prompt;
  }

  /**
   * Detect conversation context (music-related or general)
   * @param {string} message - Current user message
   * @param {Array} history - Conversation history
   * @returns {string} - 'music' or 'general'
   */
  detectConversationContext(message, history) {
    const musicKeywords = ['rhythm', 'beat', 'timing', 'music', 'practice', 'bpm', 'tempo', 'metronome', 'song', 'play', 'instrument', 'drum', 'clap'];
    const allText = (history.map(m => m.text).join(' ') + ' ' + message).toLowerCase();
    
    return musicKeywords.some(k => allText.includes(k)) ? 'music' : 'general';
  }

  /**
   * Generate feedback for timing analysis
   * @param {Object} timingAnalysis - Timing analysis results
   * @returns {Promise<string>}
   */
  async generateTimingFeedback(timingAnalysis) {
    const prompt = this.buildTimingFeedbackPrompt(timingAnalysis);
    
    try {
      if (this.huggingFaceApiKey) {
        return await this.generateWithHuggingFace(prompt);
      } else {
        return this.getTimingFallbackFeedback(timingAnalysis);
      }
    } catch (error) {
      console.error("Error generating timing feedback:", error);
      return this.getTimingFallbackFeedback(timingAnalysis);
    }
  }

  /**
   * Generate response using Hugging Face Inference API
   * @param {string} prompt - Input prompt
   * @returns {Promise<string>}
   */
  async generateWithHuggingFace(prompt) {
    try {
      const response = await fetch(
        `${this.apiUrl}/${this.huggingFaceModel}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.huggingFaceApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 150,
              temperature: 0.8,
              do_sample: true,
              return_full_text: false,
              top_p: 0.9,
              repetition_penalty: 1.2
            }
          })
        }
      );

      if (!response.ok) {
        // If model is loading, wait and retry once
        if (response.status === 503) {
          const retryAfter = response.headers.get('Retry-After') || 10;
          console.log(`Model loading, retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          
          // Retry once
          const retryResponse = await fetch(
            `${this.apiUrl}/${this.huggingFaceModel}`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.huggingFaceApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  max_length: 150,
                  temperature: 0.8,
                  do_sample: true,
                  return_full_text: false,
                  top_p: 0.9,
                  repetition_penalty: 1.2
                }
              })
            }
          );
          
          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(`Hugging Face API error: ${retryResponse.status} - ${errorText}`);
          }
          
          const retryData = await retryResponse.json();
          return this.extractResponseText(retryData);
        }
        
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return this.extractResponseText(data);
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw error;
    }
  }

  /**
   * Extract response text from Hugging Face API response
   * @param {Object|Array} data - API response data
   * @returns {string}
   */
  extractResponseText(data) {
    // Handle different response formats
    if (Array.isArray(data) && data.length > 0) {
      if (data[0]?.generated_text) {
        const text = data[0].generated_text.trim();
        // Remove the prompt if it's included in the response
        return this.cleanResponseText(text);
      } else if (data[0]?.text) {
        return data[0].text.trim();
      }
    } else if (data.generated_text) {
      const text = data.generated_text.trim();
      return this.cleanResponseText(text);
    } else if (typeof data === 'string') {
      return data.trim();
    } else if (Array.isArray(data) && data[0]) {
      return String(data[0]).trim();
    }
    
    // Fallback if format is unexpected
    console.warn('Unexpected response format:', data);
    throw new Error('Unexpected response format');
  }

  /**
   * Clean response text by removing prompt if included
   * @param {string} text - Response text
   * @returns {string}
   */
  cleanResponseText(text) {
    // Remove common prompt patterns that might be included
    // DialoGPT sometimes includes the prompt in generated_text
    const lines = text.split('\n');
    const lastLine = lines[lines.length - 1];
    
    // If the last line starts with "Picksy:", use everything after it
    if (lastLine.startsWith('Picksy:')) {
      return lastLine.substring(7).trim();
    }
    
    // Otherwise return the text as-is
    return text;
  }

  /**
   * Build prompt for timing feedback
   * @param {Object} timingAnalysis - Timing analysis results
   * @returns {string}
   */
  buildTimingFeedbackPrompt(timingAnalysis) {
    const { bpm, targetBPM, accuracy, consistency, isOnBeat } = timingAnalysis;
    
    const bpmStatus = bpm > targetBPM ? 'too fast' : bpm < targetBPM ? 'too slow' : 'perfect';
    const status = isOnBeat ? 'doing great' : 'needs improvement';
    
    return `You are Picksy, a friendly music teacher helping a child improve their rhythm timing.

Current Performance:
- Their tempo: ${bpm} BPM (Target: ${targetBPM} BPM) - ${bpmStatus}
- Timing accuracy: ${accuracy}%
- Consistency: ${consistency}%
- Status: ${status}

Provide encouraging, specific feedback in 2-3 short sentences. Be positive and give one clear tip to improve. Use simple words a child can understand.`;
  }

  /**
   * Get fallback feedback for timing
   * @param {Object} timingAnalysis - Timing analysis results
   * @returns {string}
   */
  getTimingFallbackFeedback(timingAnalysis) {
    const { bpm, targetBPM, accuracy, isOnBeat } = timingAnalysis;
    
    if (isOnBeat && accuracy > 80) {
      return "Great job! You're keeping a steady beat. Keep practicing to make it even more consistent!";
    } else if (bpm > targetBPM) {
      return "You're playing a bit too fast! Try slowing down and counting '1, 2, 3, 4' out loud to help you stay on beat.";
    } else if (bpm < targetBPM) {
      return "You're playing a bit too slow! Try tapping your foot to help you keep a steady rhythm.";
    } else {
      return "Keep practicing! Try to match the beat more closely. Count along with your rhythm!";
    }
  }

  /**
   * Set Hugging Face API key
   * @param {string} apiKey
   */
  setApiKey(apiKey) {
    this.huggingFaceApiKey = apiKey;
  }

  /**
   * Set Hugging Face model
   * @param {string} modelName
   */
  setModel(modelName) {
    this.huggingFaceModel = modelName;
  }

  /**
   * Get quick response without AI models
   * @param {string} input - User input
   * @returns {string}
   */
  getQuickResponse(input) {
    const lowerInput = input.toLowerCase().trim();
    
    // Handle greetings
    if (lowerInput === 'hey' || lowerInput === 'hi' || lowerInput === 'hello' || 
        lowerInput === 'hi there' || lowerInput === 'hey there') {
      return "Hey there! I'm Picksy. How can I help you today?";
    }
    
    if (lowerInput === 'clear' || lowerInput === 'clear chat' || lowerInput === 'start over') {
      return "I've cleared our conversation. What would you like to talk about now?";
    }
    
    if (lowerInput.includes('improve') || lowerInput.includes('better')) {
      return "To improve your rhythm, try counting out loud while you practice. Start slowly and gradually increase your speed.";
    }
    
    if (lowerInput.includes('rhythm') || lowerInput.includes('beat')) {
      return "Rhythm is the pattern of sounds and silences in music. It's like the heartbeat that keeps everything together!";
    }
    
    if (lowerInput.includes('mistake') || lowerInput.includes('wrong')) {
      return "Everyone makes mistakes when learning rhythm! Try breaking the pattern into smaller parts and practice each section.";
    }
    
    if (lowerInput.includes('practice') || lowerInput.includes('learn')) {
      return "Regular practice is key to improving rhythm. Even just 10 minutes a day makes a big difference!";
    }
    
    if (lowerInput.includes('hard') || lowerInput.includes('difficult')) {
      return "Rhythm can be challenging at first. Try tapping your foot while you practice to help maintain a steady beat.";
    }
    
    if (lowerInput.includes('time') || lowerInput.includes('timing')) {
      return "Good timing comes from practice. Try using a metronome or clapping along with your favorite songs to develop your sense of rhythm.";
    }
    
    // Generic fallback - more friendly
    return "I'm here to help! Feel free to ask me anything, or we can talk about rhythm and music if you'd like.";
  }

  /**
   * Set progress callback
   * @param {Function} callback
   */
  setProgressCallback(callback) {
    this.onProgressCallback = callback;
  }

  /**
   * Check if AI is ready
   * @returns {boolean}
   */
  getReady() {
    return this.isReady;
  }

  /**
   * Check if AI is loading
   * @returns {boolean}
   */
  getLoading() {
    return this.isLoading;
  }
}

export default AIService;

