// picksy-transformers.js - Enhanced rhythm feedback with text classification
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';

// Configure environment
env.allowLocalModels = true;
env.useBrowserCache = true;
env.cacheModels = true;
env.useProgressCallback = true;

// Global state
let textClassifier = null;
let textGenerator = null;
let isLoading = false;
let modelsAreLoading = false;

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
 * Initialize the AI models
 */
async function initModels() {
  if (textClassifier !== null && textGenerator !== null) return true;
  
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
    if (textClassifier === null) {
      try {
        showModelStatus('Loading classifier model...', 'loading');
        textClassifier = await pipeline(
          'text-classification', 
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english', 
          { 
            quantized: true,
            progress_callback: (progress) => {
              if (progress.status === 'download' && progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                showModelStatus(`Loading classifier: ${percent}%`, 'loading');
              }
            }
          }
        );
      } catch (error) {
        console.error('Text classifier loading error:', error);
      }
    }
    
    // Load text generator model
    if (textGenerator === null) {
      try {
        showModelStatus('Loading generator model...', 'loading');
        textGenerator = await pipeline(
          'text-generation',
          'distilgpt2',
          { 
            quantized: true,
            progress_callback: (progress) => {
              if (progress.status === 'download' && progress.total > 0) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                showModelStatus(`Loading generator: ${percent}%`, 'loading');
              }
            }
          }
        );
      } catch (error) {
        console.error('Text generator loading error:', error);
      }
    }
    
    // Update cache timestamp
    localStorage.setItem('picksy_model_timestamp', Date.now().toString());
    
    const modelsReady = textClassifier !== null || textGenerator !== null;
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
 * Analyze text using classification approach
 */
async function analyzeRhythmText(input) {
  // Keywords related to rhythm practice
  const keywords = {
    tempo: ['tempo', 'speed', 'slow', 'fast', 'bpm', 'metronome'],
    counting: ['count', 'counting', 'beats', 'measure', 'bar'],
    coordination: ['coordination', 'hands', 'together', 'independence'],
    reading: ['read', 'reading', 'sheet', 'notation', 'notes'],
    listening: ['listen', 'hearing', 'ear', 'record', 'playback'],
    practice: ['practice', 'rehearsal', 'routine', 'exercise', 'drill']
  };
  
  // Detect topics from keywords
  const topics = {};
  for (const [category, words] of Object.entries(keywords)) {
    topics[category] = 0;
    for (const word of words) {
      if (input.toLowerCase().includes(word.toLowerCase())) {
        topics[category] += 1;
      }
    }
  }
  
  // Find main topics (up to 2)
  const mainTopics = Object.entries(topics)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([topic]) => topic);
  
  // Get sentiment if classifier is available
  let sentiment = 'neutral';
  let confidence = 0.5;
  
  if (textClassifier !== null) {
    try {
      const result = await textClassifier(input, { topk: 2 });
      sentiment = result[0].label.toLowerCase() === 'positive' ? 'positive' : 'negative';
      confidence = result[0].score;
    } catch (error) {
      console.warn('Sentiment analysis error:', error);
    }
  }
  
  return {
    topics: mainTopics,
    sentiment,
    confidence
  };
}

/**
 * Generate detailed rhythm advice based on analysis
 */
function generateRhythmAdvice(analysis) {
  // Advice templates organized by topic
  const adviceTemplates = {
    tempo: {
      positive: [
        "Great job working on your tempo! Keep using a metronome to maintain consistency.",
        "You're doing well with controlling your speed. Try gradually increasing the tempo as you get more comfortable.",
        "Nice work with timing! Try practicing at different tempos to build flexibility."
      ],
      negative: [
        "To improve your tempo, start with a slower metronome setting and gradually increase as you build confidence.",
        "For better timing, try subdividing beats in your head (1-and-2-and) while playing at a comfortable tempo.",
        "When struggling with tempo, focus on consistency first rather than speed. Slow practice builds a solid foundation."
      ],
      neutral: [
        "Working on tempo is essential for rhythm mastery. Start slow and gradually increase speed as you practice.",
        "Using a metronome regularly will help you develop a reliable internal sense of tempo.",
        "Try practicing at 70% of your target speed until you can play perfectly, then gradually increase."
      ]
    },
    counting: {
      positive: [
        "Your counting skills are developing nicely! Continue counting out loud to reinforce the rhythm.",
        "Great work with counting beats! Try adding subdivisions to make complex rhythms easier.",
        "You're counting well! Now try counting out loud while tapping or clapping to strengthen this skill."
      ],
      negative: [
        "To improve your counting, practice speaking the counts out loud while tapping the rhythm.",
        "When you find counting difficult, try simplifying the rhythm first, then add complexity gradually.",
        "For better counting, start by just clapping and counting before adding your instrument."
      ],
      neutral: [
        "Counting aloud while practicing helps internalize rhythms and improves overall musical timing.",
        "A good approach is to count '1-and-2-and' for eighth notes or '1-e-and-a-2-e-and-a' for sixteenth notes.",
        "Regular counting practice helps you understand how different notes fit into the measure."
      ]
    },
    coordination: {
      positive: [
        "Your coordination is coming along nicely! Continue separating hand patterns before putting them together.",
        "Good work on coordination exercises! Try adding a simple foot tap to further challenge yourself.",
        "You're developing good coordination! Practice slowly and deliberately for the best results."
      ],
      negative: [
        "To improve coordination, break down the movements into smaller parts and practice them separately.",
        "When coordination is challenging, slow down significantly and focus on precision rather than speed.",
        "Try practicing each hand/part separately, then gradually combine them at a slower tempo."
      ],
      neutral: [
        "Developing good coordination requires patient practice - separate difficult parts and then combine them.",
        "Practicing coordination slowly and deliberately creates stronger neural pathways.",
        "Try tapping different rhythms with each hand to develop independence and coordination."
      ]
    },
    reading: {
      positive: [
        "You're making great progress with rhythm reading! Continue practicing with different notation examples.",
        "Nice work reading rhythms! Try sight-reading a new short example every day to build this skill.",
        "Your rhythm reading is improving! Practice identifying patterns rather than individual notes."
      ],
      negative: [
        "To improve rhythm reading, start with simpler patterns and gradually work toward more complex ones.",
        "When reading rhythms is difficult, try speaking or clapping the rhythm before playing it.",
        "Break down complex rhythmic notation into smaller segments and practice them separately."
      ],
      neutral: [
        "Regular practice with rhythm reading exercises helps develop this essential skill.",
        "Try to identify common rhythmic patterns rather than reading every individual note.",
        "Spend some time each day sight-reading new rhythmic examples to build your skills."
      ]
    },
    listening: {
      positive: [
        "Your listening skills are developing well! Continue recording yourself and comparing to original examples.",
        "Great job using your ears! The ability to hear and adjust your rhythm is invaluable.",
        "You have good rhythmic awareness! Keep listening carefully to stay precisely on beat."
      ],
      negative: [
        "To develop better listening skills, record yourself practicing and compare it to a reference recording.",
        "Try playing along with recordings to help train your ear to recognize when you're off-rhythm.",
        "Active listening exercises will help you identify rhythmic deviations more easily."
      ],
      neutral: [
        "Developing your ear for rhythm is just as important as learning to read it on paper.",
        "Recording your practice sessions helps you hear your rhythmic accuracy objectively.",
        "Listen to musicians with excellent timing and try to internalize how they feel the beat."
      ]
    },
    practice: {
      positive: [
        "Your practice routine is working well! Consistent, focused practice leads to steady improvement.",
        "Great job with your practice strategy! Regular, deliberate practice builds solid rhythm skills.",
        "You're taking a good approach to practice! Consistency will lead to lasting improvement."
      ],
      negative: [
        "Consider restructuring your practice routine to include short, focused sessions on specific rhythm challenges.",
        "When practice feels unproductive, try breaking rhythms into smaller chunks and master each part.",
        "Setting clear, achievable goals for each practice session will help you make steady progress."
      ],
      neutral: [
        "Effective rhythm practice combines focused exercises with real musical application.",
        "Short, consistent practice sessions often yield better results than occasional long ones.",
        "Using a practice journal can help you track your progress and identify areas for improvement."
      ]
    }
  };
  
  // Default advice if no specific topics found
  const defaultAdvice = [
    "To improve your rhythm, try practicing with a metronome and gradually increase the speed as you get comfortable.",
    "Developing good rhythm takes time and consistent practice. Try counting out loud while you play.",
    "One effective way to improve rhythm is to break difficult patterns into smaller parts and master each separately.",
    "Recording yourself and listening back can help identify rhythmic inconsistencies in your playing.",
    "Regular practice with a metronome is the foundation of strong rhythm skills."
  ];
  
  // Generate response based on analysis
  let response = "";
  
  if (analysis.topics.length === 0) {
    // If no specific topics detected, use default advice
    response = defaultAdvice[Math.floor(Math.random() * defaultAdvice.length)];
  } else {
    // Get primary topic
    const primaryTopic = analysis.topics[0];
    
    // Select appropriate set based on sentiment
    const sentimentType = analysis.sentiment;
    
    // Select random advice for the topic and sentiment
    const adviceList = adviceTemplates[primaryTopic][sentimentType];
    response = adviceList[Math.floor(Math.random() * adviceList.length)];
    
    // If we have a second topic, add advice for it too (but keep the response concise)
    if (analysis.topics.length > 1 && Math.random() > 0.5) {
      const secondaryTopic = analysis.topics[1];
      const secondaryAdviceList = adviceTemplates[secondaryTopic].neutral;
      const secondaryAdvice = secondaryAdviceList[Math.floor(Math.random() * secondaryAdviceList.length)];
      
      // 50% chance to add the secondary advice, keeping responses variable in length
      if (Math.random() > 0.5) {
        response += " " + secondaryAdvice;
      }
    }
  }
  
  return response;
}

/**
 * Generate quick response without using AI models
 */
function getQuickResponse(input) {
  const lowerInput = input.toLowerCase();
  
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
  
  // Default response
  return "Keep practicing your rhythm skills regularly! I'm here to help you improve.";
}

/**
 * Generate enhanced response using classification and generation
 */
async function generateResponse(input) {
  // Check cache first
  const cachedResponse = getResponseFromCache(input);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try to load models if not already loaded
  let modelsAvailable = false;
  if (!textClassifier && !textGenerator) {
    try {
      modelsAvailable = await initModels();
    } catch (error) {
      console.warn('Failed to initialize models:', error);
      modelsAvailable = false;
    }
  } else {
    modelsAvailable = true;
  }
  
  // Use quick response if no models available
  if (!modelsAvailable) {
    return getQuickResponse(input);
  }
  
  try {
    // First approach: Use classifier-based approach
    if (textClassifier) {
      try {
        // Analyze the input
        const analysis = await analyzeRhythmText(input);
        
        // Generate advice based on analysis
        const response = generateRhythmAdvice(analysis);
        
        // Cache and return
        saveResponseToCache(input, response);
        return response;
      } catch (classifierError) {
        console.warn('Classification approach failed:', classifierError);
        // Fall back to generator if available
      }
    }
    
    // Second approach: Use text generation if classifier failed or isn't available
    if (textGenerator) {
      try {
        // Create simple prompt - just the input text
        const prompt = `${input}`;
        
        // Generate response
        const result = await textGenerator(prompt, {
          max_new_tokens: 75,
          temperature: 0.7,
          top_k: 50,
          top_p: 0.9,
          do_sample: true
        });
        
        // Extract response text and clean up
        let response = result[0].generated_text.replace(prompt, '').trim();
        
        // Limit length and ensure proper punctuation
        const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length > 3) {
          response = sentences.slice(0, 3).join(' ');
        }
        
        if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
          response += '.';
        }
        
        // Cache the result
        saveResponseToCache(input, response);
        
        return response;
      } catch (generatorError) {
        console.warn('Generator approach failed:', generatorError);
        // Fall back to quick response
      }
    }
    
    // Fallback to quick response if both methods failed
    return getQuickResponse(input);
    
  } catch (error) {
    console.error('Error generating response:', error);
    return getQuickResponse(input);
  }
}

// Export functions for use in app.js
const picksyAI = {
  initModels,
  generateResponse,
  
  // Get model status
  get isReady() {
    return textClassifier !== null || textGenerator !== null;
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
