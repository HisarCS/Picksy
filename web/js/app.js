// app.js - Enhanced main application code for Picksy rhythm feedback app
let isProcessing = false;

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  // Set up chat interface
  setupChatInterface();
  
  // Set up rating buttons
  setupRatingButtons();
  
  // Set up mascot interaction
  setupMascot();
  
  // Initialize AI model in the background
  initializeAI();
  
  // Show welcome message after a brief delay
  setTimeout(() => {
    showMascotMessage("Hi! I'm Picksy! Ask me for feedback on your rhythm practice, and I'll help you improve!");
  }, 500);
}

/**
 * Initialize AI system with loading animation
 */
async function initializeAI() {
  // Create loading overlay
  const overlay = document.createElement('div');
  overlay.className = 'ai-loading-overlay';
  
  // Create loading content
  const loadingContent = document.createElement('div');
  loadingContent.className = 'ai-loading-content';
  
  // Create loading animation
  const loadingAnim = document.createElement('div');
  loadingAnim.className = 'ai-loading-animation';
  // Create 3 dots for loading animation
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'ai-loading-dot';
    loadingAnim.appendChild(dot);
  }
  
  // Create loading text
  const loadingText = document.createElement('div');
  loadingText.className = 'ai-loading-text';
  loadingText.innerHTML = '<span>Loading Picksy\'s brain</span><span class="percent"></span>';
  
  // Assemble the loading elements
  loadingContent.appendChild(loadingAnim);
  loadingContent.appendChild(loadingText);
  overlay.appendChild(loadingContent);
  
  // Add to document
  document.body.appendChild(overlay);
  
  // Add styles for loading animation
  const style = document.createElement('style');
  style.textContent = `
    .ai-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(106, 61, 173, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      transition: opacity 0.5s ease;
    }
    
    .ai-loading-content {
      background-color: white;
      border-radius: 24px;
      padding: 30px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      max-width: 90%;
      width: 300px;
    }
    
    .ai-loading-animation {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .ai-loading-dot {
      width: 20px;
      height: 20px;
      margin: 0 10px;
      background: linear-gradient(to bottom right, var(--purple-light), var(--purple-dark));
      border-radius: 50%;
      animation: ai-dot-bounce 1.4s infinite ease-in-out;
    }
    
    .ai-loading-dot:nth-child(1) {
      animation-delay: -0.32s;
    }
    
    .ai-loading-dot:nth-child(2) {
      animation-delay: -0.16s;
    }
    
    @keyframes ai-dot-bounce {
      0%, 80%, 100% { 
        transform: scale(0);
      }
      40% { 
        transform: scale(1.0);
      }
    }
    
    .ai-loading-text {
      color: var(--purple-dark);
      font-size: 18px;
      font-weight: 600;
      display: flex;
      flex-direction: column;
    }
    
    .ai-loading-text .percent {
      margin-top: 8px;
      font-size: 14px;
      opacity: 0.8;
    }
    
    .ai-status-indicator {
      position: absolute;
      bottom: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.8);
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      z-index: 100;
      transition: opacity 0.3s ease;
    }
    
    .ai-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      background-color: #f0ad4e;
      animation: pulse 1.5s infinite;
    }
    
    .ai-status-indicator.ready .ai-status-dot {
      background-color: #5cb85c;
      animation: none;
    }
    
    .ai-status-indicator.error .ai-status-dot {
      background-color: #d9534f;
      animation: none;
    }
    
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
  `;
  document.head.appendChild(style);
  
  // Add a small indicator for AI status (will remain after loading)
  const aiIndicator = document.createElement('div');
  aiIndicator.className = 'ai-status-indicator';
  aiIndicator.innerHTML = `
    <div class="ai-status-dot"></div>
    <span class="ai-status-text">AI loading</span>
  `;
  document.querySelector('.right-panel').appendChild(aiIndicator);
  
  // Initialize AI models
  try {
    // Check if picksyAI is available
    if (window.picksyAI && typeof window.picksyAI.initModels === 'function') {
      // Setup progress tracking
      let lastProgress = 0;
      
      // Create a function to handle progress updates
      const progressCallback = (progress) => {
        // Only update if there's significant progress (avoid tiny updates)
        if (progress - lastProgress >= 5 || progress >= 100) {
          loadingText.querySelector('.percent').textContent = `${progress}%`;
          lastProgress = progress;
        }
      };
      
      // Try to initialize the models with progress tracking
      window.picksyAI.onProgress = progressCallback;
      
      // Simulate progress for better UX (even if we don't get real progress)
      let simulatedProgress = 0;
      const simulateProgress = () => {
        simulatedProgress += Math.random() * 5;
        if (simulatedProgress < 95) {
          progressCallback(Math.floor(simulatedProgress));
          setTimeout(simulateProgress, 300 + Math.random() * 400);
        }
      };
      simulateProgress();
      
      // Initialize models
      const result = await window.picksyAI.initModels();
      
      // Complete progress to 100%
      progressCallback(100);
      
      // Hide the loading overlay with a fade effect
      setTimeout(() => {
        overlay.style.opacity = 0;
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 500);
      }, 500);
      
      // Update indicator based on result
      if (result) {
        aiIndicator.className = 'ai-status-indicator ready';
        aiIndicator.querySelector('.ai-status-text').textContent = 'AI ready';
        
        // Hide indicator after a few seconds
        setTimeout(() => {
          aiIndicator.style.opacity = '0';
        }, 3000);
      } else {
        aiIndicator.className = 'ai-status-indicator error';
        aiIndicator.querySelector('.ai-status-text').textContent = 'Basic mode';
        
        // Hide the loading overlay faster on error
        overlay.style.opacity = 0;
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 500);
      }
    } else {
      console.warn('PicksyAI not available, using basic mode');
      aiIndicator.className = 'ai-status-indicator error';
      aiIndicator.querySelector('.ai-status-text').textContent = 'Basic mode';
      
      // Hide the loading overlay on error
      overlay.style.opacity = 0;
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 500);
    }
  } catch (error) {
    console.error('Error initializing AI:', error);
    aiIndicator.className = 'ai-status-indicator error';
    aiIndicator.querySelector('.ai-status-text').textContent = 'Basic mode';
    
    // Hide the loading overlay on error
    overlay.style.opacity = 0;
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 500);
  }
}

/**
 * Set up the chat interface
 */
function setupChatInterface() {
  const userInput = document.querySelector('#user-input');
  const sendButton = document.querySelector('.send-button');
  
  if (userInput && sendButton) {
    // Send message on button click
    sendButton.addEventListener('click', () => {
      if (!isProcessing && userInput.value.trim()) {
        handleUserMessage(userInput.value.trim());
        userInput.value = '';
      }
    });
    
    // Send message on Enter key
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isProcessing && userInput.value.trim()) {
        handleUserMessage(userInput.value.trim());
        userInput.value = '';
      }
    });
  }
}

/**
 * Process user message and get AI feedback
 */
async function handleUserMessage(message) {
  if (isProcessing) return;
  isProcessing = true;
  
  try {
    // Show analyzing indicator
    showTypingIndicator('Analyzing');
    
    // Get response from AI with slight delay to show analyzing status
    setTimeout(async () => {
      try {
        // Change to thinking status
        showTypingIndicator('Thinking');
        
        // Get response from enhanced AI
        const response = await window.picksyAI.generateResponse(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show mascot response
        showMascotResponse(response);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show fallback response
        const fallback = "I'm having a bit of trouble with my thinking cap right now. Try asking about specific rhythm techniques you want to improve!";
        showMascotResponse(fallback);
      } finally {
        isProcessing = false;
      }
    }, 600); // Short delay to show the analyzing state
    
  } catch (error) {
    console.error('Error handling message:', error);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Show fallback response
    const fallback = "I'm having a bit of trouble with my thinking cap right now. Try asking about specific rhythm techniques you want to improve!";
    showMascotResponse(fallback);
    isProcessing = false;
  }
}

/**
 * Show typing indicator in chat bubble with custom text
 */
function showTypingIndicator(status = 'Thinking') {
  const chatBubble = document.querySelector('.chat-bubble p');
  if (!chatBubble) return;
  
  chatBubble.innerHTML = `${status} <span class='typing-dots'></span>`;
  
  // Add dots animation style if needed
  if (!document.querySelector('#typing-dots-style')) {
    const style = document.createElement('style');
    style.id = 'typing-dots-style';
    style.textContent = `
      .typing-dots:after {
        content: '.';
        animation: dots 1.5s steps(5, end) infinite;
      }
      
      @keyframes dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60% { content: '...'; }
        80%, 100% { content: ''; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  // This is handled by showMascotMessage
}

/**
 * Set up mascot interaction
 */
function setupMascot() {
  const mascot = document.querySelector('.mascot');
  
  if (mascot) {
    mascot.addEventListener('click', () => {
      if (isProcessing) return;
      
      // Animate mascot
      animateMascot();
      
      // Get rhythm tip
      handleRhythmTip();
    });
  }
}

/**
 * Animate the mascot character
 */
function animateMascot() {
  const mascot = document.querySelector('.mascot');
  if (!mascot) return;
  
  // Random rotation for more natural movement
  const rotation = Math.random() * 8 - 4;
  
  mascot.style.transform = `translateY(-10px) rotate(${rotation}deg)`;
  setTimeout(() => {
    mascot.style.transform = 'translateY(0) rotate(0)';
  }, 300);
}

/**
 * Show message in chat bubble
 */
function showMascotMessage(message) {
  const chatBubble = document.querySelector('.chat-bubble p');
  if (!chatBubble) return;
  
  // Fade out
  chatBubble.style.opacity = '0';
  
  // Change text and fade in
  setTimeout(() => {
    chatBubble.textContent = message;
    chatBubble.style.opacity = '1';
  }, 300);
}

/**
 * Show mascot response with animation
 */
function showMascotResponse(message) {
  showMascotMessage(message);
  animateMascot();
}

/**
 * Handle getting a rhythm tip
 */
async function handleRhythmTip() {
  if (isProcessing) return;
  isProcessing = true;
  
  // Show typing indicator
  showTypingIndicator('Thinking');
  
  try {
    // Enhanced set of prompts for more variety
    const prompts = [
      "Give me a quick tip for improving my rhythm skills",
      "What's one thing I can do to practice rhythm better?",
      "Share a helpful tip for learning rhythm patterns",
      "How can beginners improve their sense of rhythm?",
      "What's a creative way to practice rhythm?",
      "How can I improve my timing?",
      "What's a good exercise for developing better rhythm?",
      "How do I practice with a metronome effectively?",
      "What's a fun way to practice counting beats?",
      "How can I develop better coordination for rhythm?",
      "What should I focus on when learning new rhythm patterns?",
      "How can I tell if my rhythm is improving?"
    ];
    
    // Select random prompt
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    // Get tip from AI
    const tip = await window.picksyAI.generateResponse(randomPrompt);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Show response
    showMascotResponse(tip);
  } catch (error) {
    console.error('Error getting rhythm tip:', error);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Show fallback message
    showMascotResponse("Click on me anytime for rhythm advice!");
  } finally {
    isProcessing = false;
  }
}

/**
 * Set up rating buttons
 */
function setupRatingButtons() {
  const thumbUp = document.querySelector('.thumb-up');
  const thumbDown = document.querySelector('.thumb-down');
  
  if (thumbUp) {
    thumbUp.addEventListener('click', function() {
      if (isProcessing) return;
      
      // Visual feedback
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
      
      // Update progress
      updateProgress(15);
      
      // Get positive feedback
      handleFeedbackRequest(true);
    });
  }
  
  if (thumbDown) {
    thumbDown.addEventListener('click', function() {
      if (isProcessing) return;
      
      // Visual feedback
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
      
      // Get improvement feedback
      handleFeedbackRequest(false);
    });
  }
}

/**
 * Handle feedback request from rating buttons
 */
async function handleFeedbackRequest(isPositive) {
  if (isProcessing) return;
  isProcessing = true;
  
  // Show typing indicator
  showTypingIndicator(isPositive ? 'Analyzing your progress' : 'Analyzing your practice');
  
  // Enhanced prompts for more specific feedback
  const positivePrompts = [
    "Tell me what I did well in my rhythm practice",
    "What aspects of my rhythm playing are improving?", 
    "Give me specific positive feedback on my rhythm skills",
    "What rhythm strengths am I showing in my practice?",
    "Tell me one thing I'm doing well with rhythm"
  ];
  
  const negativePrompts = [
    "Tell me how I can improve my rhythm skills",
    "What should I focus on to get better at rhythm?",
    "Give me a specific way to improve my rhythm practice",
    "What rhythm technique should I work on next?",
    "What's one rhythm weakness I should address?"
  ];
  
  try {
    // Select a random prompt based on feedback type
    const prompts = isPositive ? positivePrompts : negativePrompts;
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    // Short delay to show analyzing state
    setTimeout(async () => {
      try {
        // Change to thinking indicator
        showTypingIndicator('Thinking');
        
        // Get response from AI
        const response = await window.picksyAI.generateResponse(prompt);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show response
        showMascotResponse(response);
      } catch (error) {
        console.error('Error getting feedback:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show fallback message
        const fallback = isPositive
          ? "You're doing great keeping the beat! Your rhythm is getting better with practice."
          : "Try focusing on counting out loud while you practice - it can help you stay on beat.";
        
        showMascotResponse(fallback);
      } finally {
        isProcessing = false;
      }
    }, 800);
    
  } catch (error) {
    console.error('Error handling feedback request:', error);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Show fallback message
    const fallback = isPositive
      ? "You're doing great keeping the beat! Your rhythm is getting better with practice."
      : "Try focusing on counting out loud while you practice - it can help you stay on beat.";
    
    showMascotResponse(fallback);
    isProcessing = false;
  }
}

/**
 * Update progress bar
 */
function updateProgress(amount) {
  const progressBar = document.querySelector('.progress');
  if (!progressBar) return;
  
  // Get current width
  const currentWidth = parseInt(progressBar.style.width || '0');
  
  // Calculate new width (cap at 100%)
  const newWidth = Math.min(currentWidth + amount, 100);
  
  // Update width with transition
  progressBar.style.transition = 'width 0.5s ease-in-out';
  progressBar.style.width = `${newWidth}%`;
  
  // Celebrate if reaching 100%
  if (newWidth >= 100) {
    celebrateProgress();
  }
}

/**
 * Celebrate progress completion
 */
async function celebrateProgress() {
  // Animate trophy
  const trophy = document.querySelector('.trophy');
  if (trophy) {
    trophy.style.animation = 'none';
    setTimeout(() => {
      trophy.style.animation = 'bounce 0.5s 5 alternate';
    }, 10);
  }
  
  // Add bounce animation style if needed
  if (!document.querySelector('#bounce-style')) {
    const style = document.createElement('style');
    style.id = 'bounce-style';
    style.textContent = `
      @keyframes bounce {
        from { transform: translateY(0); }
        to { transform: translateY(-15px); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Get celebration message from AI
  if (isProcessing) {
    showMascotMessage("Congratulations! You've completed this level!");
    return;
  }
  
  isProcessing = true;
  
  try {
    // Enhanced celebration prompts
    const celebrationPrompts = [
      "I just completed a level in my rhythm practice! Give me an encouraging message.",
      "I've made progress in my rhythm skills! Give me a celebration message.",
      "Tell me something motivating about completing a rhythm practice challenge.",
      "Give me an encouraging message for reaching a rhythm milestone.",
      "Share an uplifting message about my rhythm progress."
    ];
    
    // Select random prompt
    const prompt = celebrationPrompts[Math.floor(Math.random() * celebrationPrompts.length)];
    
    // Show analyzing then thinking
    showTypingIndicator('Celebrating');
    
    setTimeout(async () => {
      const response = await window.picksyAI.generateResponse(prompt);
      showMascotResponse(response);
      isProcessing = false;
    }, 600);
    
  } catch (error) {
    console.error('Error getting celebration message:', error);
    showMascotMessage("Congratulations! You've completed this level!");
    isProcessing = false;
  }
  
  // Reset progress after delay
  setTimeout(() => {
    const progressBar = document.querySelector('.progress');
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      
      // Re-enable transition
      setTimeout(() => {
        progressBar.style.transition = 'width 0.5s ease-in-out';
      }, 50);
    }
  }, 5000);
}
