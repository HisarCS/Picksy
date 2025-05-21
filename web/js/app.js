// app.js - Enhanced main application code for Picksy rhythm feedback app with original UI

let isProcessing = false;
let awaitingResponse = false;
let typingTimer = null;
let conversationMode = false; // Track when we're in an active back-and-forth conversation

document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
  console.log("Initializing Picksy app...");
  
  // Set up chat interface
  setupChatInterface();
  
  // Set up rating buttons
  setupRatingButtons();
  
  // Set up mascot interaction
  setupMascot();
  
  // Initialize AI model in the background
  initializeAI();
  
  // Add conversation controls
  addConversationControls();
  
  // Set up audio input if available
  setupMicrophoneInput();
  
  // Show welcome message after a brief delay
  setTimeout(() => {
    showMascotMessage("Hi! I'm Picksy! Ask me anything about rhythm, timing, or music practice!");
  }, 500);
}

/**
 * Add conversation controls to the UI
 */
function addConversationControls() {
  // Create container for conversation controls
  const controlsContainer = document.createElement('div');
  controlsContainer.className = 'conversation-controls';
  controlsContainer.style.display = 'flex';
  controlsContainer.style.justifyContent = 'center';
  controlsContainer.style.margin = '10px 0';
  
  // Create clear conversation button
  const clearButton = document.createElement('button');
  clearButton.className = 'clear-conversation';
  clearButton.textContent = 'Clear Conversation';
  clearButton.style.background = '#fff';
  clearButton.style.border = '2px solid var(--purple-light)';
  clearButton.style.borderRadius = '20px';
  clearButton.style.padding = '5px 15px';
  clearButton.style.fontSize = '14px';
  clearButton.style.color = 'var(--purple-dark)';
  clearButton.style.cursor = 'pointer';
  clearButton.style.transition = 'all 0.2s ease';
  
  clearButton.addEventListener('mouseover', () => {
    clearButton.style.background = 'var(--purple-light)';
    clearButton.style.color = 'white';
    clearButton.style.transform = 'translateY(-2px)';
  });
  
  clearButton.addEventListener('mouseout', () => {
    clearButton.style.background = '#fff';
    clearButton.style.color = 'var(--purple-dark)';
    clearButton.style.transform = 'translateY(0)';
  });
  
  clearButton.addEventListener('click', () => {
    if (window.picksyAI && window.picksyAI.clearConversationHistory) {
      const response = window.picksyAI.clearConversationHistory();
      showMascotMessage(response);
      conversationMode = false;
    } else {
      showMascotMessage("I've cleared our conversation. What would you like to talk about now?");
    }
  });
  
  // Add the button to the container
  controlsContainer.appendChild(clearButton);
  
  // Find an appropriate place in the UI to add the controls
  const inputContainer = document.querySelector('.chat-input');
  if (inputContainer) {
    inputContainer.parentNode.insertBefore(controlsContainer, inputContainer);
  }
}

/**
 * Set up microphone for rhythm analysis
 */
function setupMicrophoneInput() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Just prepare the interface elements for now
    const micInfo = document.querySelector('.mic-info .value');
    if (micInfo) {
      micInfo.textContent = "Click to enable";
      
      micInfo.addEventListener('click', () => {
        requestMicrophoneAccess();
      });
    }
  }
}

/**
 * Request microphone access
 */
async function requestMicrophoneAccess() {
  try {
    const micInfo = document.querySelector('.mic-info .value');
    
    if (micInfo) {
      micInfo.textContent = "Requesting...";
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Set up audio processing
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    // Configure analyser
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Update the waveform visualization
    const waveform = document.querySelector('.waveform');
    
    if (waveform) {
      // Clear existing waveform content except the grid and mic info
      const existingGrid = waveform.querySelector('.grid');
      const existingMicInfo = waveform.querySelector('.mic-info');
      
      waveform.innerHTML = '';
      
      if (existingGrid) {
        waveform.appendChild(existingGrid);
      }
      
      if (existingMicInfo) {
        waveform.appendChild(existingMicInfo);
      }
      
      // Create the waveform bars
      const waveformContainer = document.createElement('div');
      waveformContainer.className = 'waveform-bars';
      
      for (let i = 0; i < bufferLength; i++) {
        const bar = document.createElement('div');
        bar.className = 'waveform-bar';
        waveformContainer.appendChild(bar);
      }
      
      waveform.appendChild(waveformContainer);
      
      // Add waveform styles
      const style = document.createElement('style');
      style.textContent = `
        .waveform-bars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 10px;
          box-sizing: border-box;
          z-index: 1;
        }
        
        .waveform-bar {
          width: 4px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 2px;
          height: 5px;
          transition: height 0.05s ease;
        }
      `;
      document.head.appendChild(style);
      
      // Update mic info
      if (micInfo) {
        micInfo.textContent = "Active";
      }
      
      // Start updating waveform
      updateWaveform();
      
      function updateWaveform() {
        requestAnimationFrame(updateWaveform);
        
        analyser.getByteFrequencyData(dataArray);
        
        const bars = document.querySelectorAll('.waveform-bar');
        const average = Array.from(dataArray).reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        // Update mic value with the average level
        if (micInfo) {
          micInfo.textContent = Math.round(average);
        }
        
        for (let i = 0; i < bars.length; i++) {
          const index = Math.floor(i * (dataArray.length / bars.length));
          const value = dataArray[index];
          const height = (value / 255) * 100;
          bars[i].style.height = `${height}%`;
        }
      }
    }
    
  } catch (error) {
    console.error('Error accessing microphone:', error);
    
    const micInfo = document.querySelector('.mic-info .value');
    if (micInfo) {
      micInfo.textContent = "Access denied";
    }
  }
}

/**
 * Initialize AI system with loading animation
 */
async function initializeAI() {
  console.log("Initializing AI system...");
  
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
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
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
    
    .user-typing-indicator {
      position: absolute;
      bottom: 65px;
      left: 20px;
      font-size: 12px;
      color: var(--purple-dark);
      opacity: 0.7;
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
      console.log("PicksyAI found, initializing models...");
      
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
      if (window.picksyAI.onProgress) {
        window.picksyAI.onProgress = progressCallback;
      }
      
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
      let result = false;
      try {
        result = await window.picksyAI.initModels();
        console.log("Model initialization result:", result);
      } catch (modelError) {
        console.error("Error initializing models:", modelError);
      }
      
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
      
      // Create a basic implementation of picksyAI if not available
      if (!window.picksyAI) {
        console.log("Creating fallback picksyAI object");
        window.picksyAI = {
          generateResponse: function(input) {
            return Promise.resolve(getQuickResponse(input));
          },
          initModels: function() {
            return Promise.resolve(false);
          },
          isReady: false,
          isLoading: false
        };
      }
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
    
    // Create a basic implementation of picksyAI if not available
    if (!window.picksyAI) {
      console.log("Creating fallback picksyAI object after error");
      window.picksyAI = {
        generateResponse: function(input) {
          return Promise.resolve(getQuickResponse(input));
        },
        initModels: function() {
          return Promise.resolve(false);
        },
        isReady: false,
        isLoading: false
      };
    }
  }
}

/**
 * Generate quick response without using AI models
 */
function getQuickResponse(input) {
  const lowerInput = input.toLowerCase();
  
  // Handle special commands
  if (lowerInput === 'clear' || lowerInput === 'clear chat' || lowerInput === 'start over') {
    return "I've cleared our conversation. What would you like to talk about now?";
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
  
  // Default response
  return "Keep practicing your rhythm skills regularly! I'm here to help you improve.";
}

/**
 * Set up the chat interface
 */
function setupChatInterface() {
  console.log("Setting up chat interface...");
  const userInput = document.querySelector('#user-input');
  const sendButton = document.querySelector('.send-button');
  const inputContainer = document.querySelector('.input-container');
  
  if (userInput && sendButton) {
    console.log("Found input and send button, attaching handlers");
    
    // Add typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'user-typing-indicator';
    typingIndicator.textContent = 'Picksy is thinking...';
    typingIndicator.style.display = 'none';
    
    if (inputContainer) {
      inputContainer.appendChild(typingIndicator);
    }
    
    // Send message on button click
    sendButton.addEventListener('click', () => {
      console.log("Send button clicked, processing:", !isProcessing, "Input:", userInput.value.trim());
      if (!isProcessing && userInput.value.trim()) {
        handleUserMessage(userInput.value.trim());
        userInput.value = '';
      }
    });
    
    // Send message on Enter key
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !isProcessing && userInput.value.trim()) {
        console.log("Enter pressed, sending message");
        handleUserMessage(userInput.value.trim());
        userInput.value = '';
      }
    });
    
    // Add "thinking" indicator when user is typing
    userInput.addEventListener('input', () => {
      if (userInput.value.trim() && !awaitingResponse) {
        // Clear existing timer
        if (typingTimer) {
          clearTimeout(typingTimer);
        }
        
        // Set new timer to show thinking indicator
        typingTimer = setTimeout(() => {
          typingIndicator.style.display = 'block';
          typingIndicator.textContent = 'Picksy is thinking...';
          
          // Hide after 2 seconds
          setTimeout(() => {
            typingIndicator.style.display = 'none';
          }, 2000);
        }, 1000);
      } else {
        // Clear timer if input is empty
        if (typingTimer) {
          clearTimeout(typingTimer);
          typingTimer = null;
        }
        
        typingIndicator.style.display = 'none';
      }
    });
    
    // Make sure buttons are enabled
    sendButton.disabled = false;
    userInput.disabled = false;
  } else {
    console.error("Could not find input or send button!");
    if (!userInput) console.error("User input element not found");
    if (!sendButton) console.error("Send button not found");
  }
}

/**
 * Process user message and get AI feedback
 */
async function handleUserMessage(message) {
  console.log("Handling user message:", message);
  
  if (isProcessing) {
    console.log("Already processing a message, ignoring");
    return;
  }
  
  isProcessing = true;
  awaitingResponse = true;
  console.log("isProcessing set to true");
  conversationMode = true; // Enable conversation mode when user sends a message
  
  try {
    // Special command: clear conversation
    if (message.toLowerCase() === 'clear' || message.toLowerCase() === 'clear conversation') {
      if (window.picksyAI && window.picksyAI.clearConversationHistory) {
        const response = window.picksyAI.clearConversationHistory();
        showMascotMessage(response);
        isProcessing = false;
        awaitingResponse = false;
        conversationMode = false;
        return;
      }
    }
    
    // Show analyzing indicator
    showTypingIndicator('Analyzing');
    
    // Get response from AI with slight delay to show analyzing status
    setTimeout(async () => {
      try {
        // Change to thinking status
        showTypingIndicator('Thinking');
        
        console.log("Generating response for:", message);
        
        // Make sure picksyAI exists
        if (!window.picksyAI || !window.picksyAI.generateResponse) {
          console.error("picksyAI not available, using fallback");
          hideTypingIndicator();
          showMascotResponse(getQuickResponse(message));
          isProcessing = false;
          awaitingResponse = false;
          return;
        }
        
        // Get response from enhanced AI
        let response;
        try {
          response = await window.picksyAI.generateResponse(message);
          console.log("Response received:", response);
        } catch (aiError) {
          console.error("Error from picksyAI:", aiError);
          response = getQuickResponse(message);
        }
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show mascot response with a slight delay for realism
        setTimeout(() => {
          showMascotResponse(response);
          isProcessing = false;
          awaitingResponse = false;
        }, 300);
        
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Show fallback response
        const fallback = "I'm having a bit of trouble with my thinking cap right now. Try asking about specific rhythm techniques you want to improve!";
        showMascotResponse(fallback);
        console.log("Setting isProcessing to false");
        isProcessing = false;
        awaitingResponse = false;
      }
    }, 600); // Short delay to show the analyzing state
    
  } catch (error) {
    console.error('Error handling message:', error);
    
    // Hide typing indicator
    hideTypingIndicator();
    
    // Show fallback response
    const fallback = "I'm having a bit of trouble with my thinking cap right now. Try asking about specific rhythm techniques you want to improve!";
    showMascotResponse(fallback);
    console.log("Setting isProcessing to false after error");
    isProcessing = false;
    awaitingResponse = false;
  }
}

/**
 * Show typing indicator in chat bubble with custom text
 */
function showTypingIndicator(status = 'Thinking') {
  const chatBubble = document.querySelector('.chat-bubble p');
  if (!chatBubble) {
    console.error("Chat bubble not found!");
    return;
  }
  
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
      
      // Only get random tip if not in conversation mode
      if (!conversationMode) {
        // Animate mascot
        animateMascot();
        
        // Get rhythm tip
        handleRhythmTip();
      } else {
        // If in conversation mode, suggest continuing the conversation
        animateMascot();
        showMascotMessage("Do you have any more questions about rhythm or music practice? I'm here to help!");
      }
    });
  } else {
    console.error("Mascot element not found!");
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
  if (!chatBubble) {
    console.error("Chat bubble not found!");
    return;
  }
  
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
  
  // Update progress based on context
  if (conversationMode && Math.random() > 0.7) {
    // Sometimes update progress during conversations to give sense of advancement
    updateProgress(Math.floor(Math.random() * 5) + 3);
  }
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
    let tip;
    try {
      if (window.picksyAI && window.picksyAI.generateResponse) {
        tip = await window.picksyAI.generateResponse(randomPrompt);
      } else {
        tip = getQuickResponse(randomPrompt);
      }
    } catch (error) {
      console.error("Error getting tip:", error);
      tip = getQuickResponse(randomPrompt);
    }
    
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
      
      // Get positive feedback if not in conversation mode
      // If in conversation mode, integrate with conversation
      if (conversationMode) {
        handleUserMessage("That was helpful, thanks!");
      } else {
        handleFeedbackRequest(true);
      }
    });
  } else {
    console.error("Thumb up button not found!");
  }
  
  if (thumbDown) {
    thumbDown.addEventListener('click', function() {
      if (isProcessing) return;
      
      // Visual feedback
      this.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.style.transform = 'scale(1)';
      }, 200);
      
      // Get improvement feedback if not in conversation mode
      // If in conversation mode, integrate with conversation
      if (conversationMode) {
        handleUserMessage("I'm still having trouble understanding. Can you explain differently?");
      } else {
        handleFeedbackRequest(false);
      }
    });
  } else {
    console.error("Thumb down button not found!");
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
        let response;
        try {
          if (window.picksyAI && window.picksyAI.generateResponse) {
            response = await window.picksyAI.generateResponse(prompt);
          } else {
            response = getQuickResponse(prompt);
          }
        } catch (error) {
          console.error("Error getting feedback:", error);
          response = getQuickResponse(prompt);
        }
        
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
  if (!progressBar) {
    console.error("Progress bar not found!");
    return;
  }
  
  // Get current width
  const currentWidth = parseInt(progressBar.style.width || '0');
  
  // Calculate new width (cap at 100%)
  const newWidth = Math.min(currentWidth + amount, 100);
  
  // Update width with transition
  progressBar.style.transition = 'width 0.5s ease-in-out';
  progressBar.style.width = `${newWidth}%`;
  
  // Update counter in header
  const counter = document.querySelector('.counter');
  if (counter) {
    // Random score between 30-50 based on progress
    const score = Math.floor(30 + (newWidth / 100) * 20);
    counter.textContent = score;
    
    // Animate counter update
    counter.style.transform = 'scale(1.2)';
    setTimeout(() => {
      counter.style.transform = 'scale(1)';
    }, 300);
  }
  
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
  } else {
    console.error("Trophy element not found!");
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
      let response;
      try {
        if (window.picksyAI && window.picksyAI.generateResponse) {
          response = await window.picksyAI.generateResponse(prompt);
        } else {
          response = "Congratulations! You've completed this level and you're making great progress!";
        }
      } catch (error) {
        console.error("Error getting celebration message:", error);
        response = "Congratulations! You've completed this level and you're making great progress!";
      }
      
      showMascotResponse(response);
      isProcessing = false;
      
      // Update level
      updateLevel();
      
    }, 600);
    
  } catch (error) {
    console.error('Error getting celebration message:', error);
    showMascotMessage("Congratulations! You've completed this level!");
    isProcessing = false;
    
    // Update level
    updateLevel();
  }
  
  // Update attempt history
  const attemptsList = document.querySelector('.attempts-history ul');
  if (attemptsList) {
    const currentLevel = document.querySelector('.level-value')?.textContent || '1/5';
    const currentLevelNum = parseInt(currentLevel) || 1;
    
    const newAttempt = document.createElement('li');
    newAttempt.textContent = `Level ${currentLevelNum}: %${Math.floor(85 + Math.random() * 15)}`;
    attemptsList.appendChild(newAttempt);
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

/**
 * Update level after completing a level
 */
function updateLevel() {
  const levelValue = document.querySelector('.level-value');
  if (!levelValue) return;
  
  const currentLevel = levelValue.textContent;
  const match = currentLevel.match(/(\d+)\/(\d+)/);
  
  if (match) {
    const level = parseInt(match[1]);
    const total = parseInt(match[2]);
    
    const newLevel = Math.min(level + 1, total);
    levelValue.textContent = `${newLevel}/${total}`;
    
    // Animate level update
    levelValue.style.transform = 'scale(1.3)';
    levelValue.style.color = 'var(--green)';
    setTimeout(() => {
      levelValue.style.transform = 'scale(1)';
      levelValue.style.color = 'var(--purple-dark)';
    }, 800);
  }
}
