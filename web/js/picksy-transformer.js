// picksy-webllm.js - Enhanced rhythm feedback with WebLLM while keeping original UI
import { AutoModel, TextClassification } from '@mlc-ai/web-llm';

// Global state
let llmModel = null;
let classifierModel = null;
let isLoading = false;
let modelsAreLoading = false;
let conversationHistory = [];
const MAX_HISTORY_LENGTH = 10; // Store more history while maintaining original UI

// Create status indicator
const statusContainer = document.createElement('div');
statusContainer.className = 'ai-status';
statusContainer.innerHTML = '<div class="ai-dot"></div><span class="ai-text">AI Limited</span>';
document.body.appendChild(statusContainer);

// Add necessary styles
const styleElement = document.createElement('style');
styleElement.textContent = `
  .ai-status {
    position: fixed;
    top: 15px;
    right: 15px;
    display: flex;
    align-items: center;
    background: white;
    padding: 8px 15px;
    border-radius: 20px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
  }
  
  .ai-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: #d9534f;
  }
  
  .ai-status.ready .ai-dot {
    background-color: #5cb85c;
  }
  
  .ai-status.loading .ai-dot {
    background-color: #f0ad4e;
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;
document.head.appendChild(styleElement);

/**
 * Show model status
 */
function showModelStatus(message, type = 'info') {
  statusContainer.className = 'ai-status ' + type;
  statusContainer.querySelector('.ai-text').textContent = message;
}

/**
 * Add an exchange to conversation history
 */
function addToConversationHistory(userInput, aiResponse) {
  conversationHistory.push({
    role: "user",
    content: userInput
  });
  
  conversationHistory.push({
    role: "assistant",
    content: aiResponse
  });
  
  // Keep history at manageable size but preserve initial system message
  while (conversationHistory.length > MAX_HISTORY_LENGTH * 2 + 1) {
    // Remove the oldest user/assistant exchange (2 items) but keep system message
    conversationHistory.splice(1, 2);
  }
  
  // Also store in localStorage for persistence
  try {
    localStorage.setItem('picksy_conversation_history', JSON.stringify(conversationHistory));
  } catch (error) {
    console.warn('Failed to save conversation history:', error);
  }
}

/**
 * Load conversation history from localStorage
 */
function loadConversationHistory() {
  try {
    const savedHistory = localStorage.getItem('picksy_conversation_history');
    if (savedHistory) {
      conversationHistory = JSON.parse(savedHistory);
    } else {
      // Initialize with system message if no history exists
      initializeConversation();
    }
  } catch (error) {
    console.warn('Failed to load conversation history:', error);
    initializeConversation();
  }
}

/**
 * Initialize a new conversation with system message
 */
function initializeConversation() {
  conversationHistory = [{
    role: "system",
    content: `You are Picksy, a friendly and knowledgeable music teacher specializing in rhythm education for students of all ages. 
You have expertise in musical rhythm, timing, beat patterns, and music theory related to rhythm concepts.

Guidelines for your responses:
1. Be friendly, encouraging, and kid-friendly in your tone
2. Keep responses relatively concise (2-3 sentences), focusing on clarity
3. Use specific examples and analogies to explain rhythm concepts
4. Be encouraging of student efforts and progress
5. Provide practical advice that students can immediately apply to their practice
6. Tailor your explanations to the student's experience level when it's clear from context

Your purpose is to help students improve their rhythm skills through conversation, advice, and encouragement.`
  }];
}

/**
 * Clear the conversation history and start fresh
 */
function clearConversationHistory() {
  initializeConversation();
  
  // Save to localStorage
  try {
    localStorage.setItem('picksy_conversation_history', JSON.stringify(conversationHistory));
  } catch (error) {
    console.warn('Failed to save conversation history:', error);
  }
  
  return "I've cleared our conversation. What would you like to talk about now?";
}

/**
 * Hash string for caching
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Save response to cache
 */
function saveResponseToCache(input, result) {
  try {
    const cacheKey = `picksy_${hashString(input)}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      result: result
    }));
  } catch (error) {
    console.warn('Cache save error:', error);
  }
}

/**
 * Get response from cache
 */
function getResponseFromCache(input) {
  try {
    const cacheKey = `picksy_${hashString(input)}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const parsedCache = JSON.parse(cached);
      const cacheAge = Date.now() - parsedCache.timestamp;
      
      // Cache expires after 24 hours
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return parsedCache.result;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Initialize the AI models using WebLLM
 */
async function initModels() {
  if (llmModel !== null && classifierModel !== null) return true;
  
  if (modelsAreLoading) {
    showModelStatus('AI Loading...', 'loading');
    return false;
  }
  
  try {
    modelsAreLoading = true;
    isLoading = true;
    showModelStatus('AI Loading...', 'loading');
    
    // Check for model cache timestamp
    const cacheTimestamp = localStorage.getItem('picksy_model_timestamp');
    if (cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      if (cacheAge < 24 * 60 * 60 * 1000) {
        showModelStatus('Loading from cache...', 'loading');
      }
    }
    
    // Load text classifier model first
    if (classifierModel === null) {
      try {
        showModelStatus('Loading classifier model...', 'loading');
        
        classifierModel = await TextClassification.create({
          model: 'tiny-bert-sst2',
          quantized: true,
          progressCallback: (progress) => {
            if (progress.percent) {
              showModelStatus(`Loading classifier: ${Math.round(progress.percent * 100)}%`, 'loading');
            }
          }
        });
      } catch (error) {
        console.error('Text classifier loading error:', error);
      }
    }
    
    // Load LLM model
    if (llmModel === null) {
      try {
        showModelStatus('Loading LLM model...', 'loading');
        
        // Try to load the best available model first
        try {
          llmModel = await AutoModel.create({
            model: 'Phi-2',
            quantized: true,
            progressCallback: (progress) => {
              if (progress.percent) {
                showModelStatus(`Loading LLM: ${Math.round(progress.percent * 100)}%`, 'loading');
              }
            }
          });
        } catch (error) {
          console.warn('Primary model loading error, trying fallback:', error);
          
          // Fallback to smaller model
          llmModel = await AutoModel.create({
            model: 'TinyLlama-1.1B-Chat',
            quantized: true,
            progressCallback: (progress) => {
              if (progress.percent) {
                showModelStatus(`Loading LLM: ${Math.round(progress.percent * 100)}%`, 'loading');
              }
            }
          });
        }
      } catch (error) {
        console.error('All LLM loading attempts failed:', error);
      }
    }
    
    // Load conversation history
    loadConversationHistory();
    
    // Update cache timestamp
    localStorage.setItem('picksy_model_timestamp', Date.now().toString());
    
    const modelsReady = llmModel !== null || classifierModel !== null;
    if (modelsReady) {
      showModelStatus('AI Ready', 'ready');
    } else {
      showModelStatus('AI Limited', 'error');
    }
    
    return modelsReady;
    
  } catch (error) {
    console.error('Model loading error:', error);
    showModelStatus('AI Limited', 'error');
    return false;
  } finally {
    modelsAreLoading = false;
    isLoading = false;
  }
}

/**
 * Generate a response using the LLM in ChatGPT-like fashion
 */
async function generateLLMResponse(input) {
  if (!llmModel) return null;
  
  try {
    // Special command handling
    if (input.toLowerCase().trim() === 'clear' || 
        input.toLowerCase().trim() === 'clear conversation' || 
        input.toLowerCase().trim() === 'start over') {
      return clearConversationHistory();
    }
    
    // Check cache first for exact matches
    const cachedResponse = getResponseFromCache(input);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Prepare the messages for the LLM in ChatML format
    const messages = [...conversationHistory, { role: "user", content: input }];
    
    console.log("Using messages format:", messages);
    
    // Format into a prompt the model can understand (simple way to handle ChatML format)
    let prompt = "";
    for (const message of messages) {
      if (message.role === "system") {
        prompt += `<s>\n${message.content}\n</s>\n\n`;
      } else if (message.role === "user") {
        prompt += `<human>\n${message.content}\n</human>\n\n`;
      } else if (message.role === "assistant") {
        prompt += `<assistant>\n${message.content}\n</assistant>\n\n`;
      }
    }
    
    // Add final assistant prompt
    prompt += "<assistant>\n";
    
    console.log("Formatted prompt:", prompt);
    
    // Generate response with appropriate parameters for conversational AI
    const result = await llmModel.generate({
      prompt: prompt,
      max_tokens: 150, // Shorter for original UI fit
      temperature: 0.7, 
      top_p: 0.9,
      top_k: 40
    });
    
    // Process the result
    let response = result.text.trim();
    
    // Clean up the response
    response = response
      .replace(/^(as picksy|picksy here|i'm picksy|i am picksy)/i, '')
      .replace(/^[:,-]\s*/i, '')
      .trim();
    
    // Ensure proper ending punctuation
    if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
      response += '.';
    }
    
    // Limit response length for UI compatibility
    const sentences = response.match(/[^.!?]+[.!?]+/g) || [response];
    if (sentences.length > 4) {
      response = sentences.slice(0, 4).join(' ');
    }
    
    // Save to cache
    saveResponseToCache(input, response);
    
    return response;
  } catch (error) {
    console.warn('LLM generation error:', error);
    return null;
  }
}

/**
 * Generate quick response without using AI models
 */
function getQuickResponse(input) {
  // Handle the 'clear' command even in fallback mode
  if (input.toLowerCase().trim() === 'clear' || 
      input.toLowerCase().trim() === 'clear conversation' || 
      input.toLowerCase().trim() === 'start over') {
    return clearConversationHistory();
  }
  
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    return "Hi there! I'm Picksy, your rhythm learning assistant. How can I help you with music today?";
  }
  
  if (lowerInput.includes('who are you') || lowerInput.includes('what are you')) {
    return "I'm Picksy, an AI assistant designed to help you learn rhythm and improve your musical timing skills!";
  }
  
  if (lowerInput.includes('thanks') || lowerInput.includes('thank you')) {
    return "You're welcome! Happy to help with your rhythm journey. Let me know if you have more questions!";
  }
  
  // Check for keywords
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
  
  if (lowerInput.includes('metronome')) {
    return "A metronome is an essential tool for rhythm practice! Start with a slow tempo where you can play accurately, then gradually increase the speed.";
  }
  
  // Default response
  return "Keep practicing your rhythm skills regularly! I'm here to help you improve.";
}

/**
 * Main function to generate a response using all available tools
 */
async function generateResponse(input) {
  // Try to load models if not already loaded
  let modelsAvailable = false;
  if (!llmModel && !classifierModel) {
    try {
      modelsAvailable = await initModels();
    } catch (error) {
      console.warn('Failed to initialize models:', error);
      modelsAvailable = false;
    }
  } else {
    modelsAvailable = true;
  }
  
  try {
    // First approach: Try using the LLM directly
    if (llmModel) {
      try {
        const llmResponse = await generateLLMResponse(input);
        
        if (llmResponse) {
          // Add to conversation history
          addToConversationHistory(input, llmResponse);
          return llmResponse;
        }
      } catch (llmError) {
        console.warn('LLM approach failed:', llmError);
        // Fall back to simple response
      }
    }
    
    // If LLM fails, use quick response
    const fallbackResponse = getQuickResponse(input);
    
    // Add to conversation history
    addToConversationHistory(input, fallbackResponse);
    
    return fallbackResponse;
    
  } catch (error) {
    console.error('Error generating response:', error);
    const fallbackResponse = getQuickResponse(input);
    
    // Still add to conversation history
    addToConversationHistory(input, fallbackResponse);
    
    return fallbackResponse;
  }
}

/**
 * Get the current conversation history
 */
function getConversationHistory() {
  return [...conversationHistory];
}

// Export functions for use in app.js
const picksyAI = {
  initModels,
  generateResponse,
  getConversationHistory,
  clearConversationHistory,
  
  // Get model status
  get isReady() {
    return llmModel !== null || classifierModel !== null;
  },
  
  get isLoading() {
    return isLoading || modelsAreLoading;
  }
};

// Start loading the models in the background
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    initModels().catch(err => console.warn('Background model loading failed:', err));
  });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    initModels().catch(err => console.warn('Background model loading failed:', err));
  }, 1000);
}

// Add to window for access from other scripts
window.picksyAI = picksyAI;

export default picksyAI;
