// app.js - Main application entry point using Abstract Factory Pattern

import AppFactory from './core/AppFactory.js';

/**
 * Main Application Class
 */
class PicksyApp {
  constructor() {
    this.factory = new AppFactory();
    this.models = {};
    this.services = {};
    this.components = {};
    this.isProcessing = false;
  }

/**
 * Initialize the application
 */
  async initialize() {
    console.log("Initializing Picksy app with Factory Pattern...");
  
    // Create models
    this.createModels();

    // Create services
    this.createServices();
  
    // Create components
    this.createComponents();
  
    // Setup component interactions
    this.setupInteractions();
  
    // Initialize services
    await this.initializeServices();
  
    // Load saved data
    this.loadSavedData();
  }

  /**
   * Create models using ModelFactory
   */
  createModels() {
    const modelFactory = this.factory.getModelFactory();

    // Load saved data if available
    const storageService = this.factory.createService('storage');
    const savedProgress = storageService.loadProgress();
    const savedConversation = storageService.loadConversation();
    const savedReviews = storageService.loadReviews();

    this.models.progress = modelFactory.createModel('progress', savedProgress || {});
    this.models.conversation = modelFactory.createModel('conversation', savedConversation || {});
    this.models.review = modelFactory.createModel('review', savedReviews || {});
  }

  /**
   * Create services using ServiceFactory
   */
  createServices() {
    const serviceFactory = this.factory.getServiceFactory();

    this.services.ai = serviceFactory.createService('ai');
    this.services.audio = serviceFactory.createService('audio');
    this.services.storage = serviceFactory.createService('storage');
    this.services.timingAnalysis = serviceFactory.createService('timingAnalysis');
  }

  /**
   * Create components using ComponentFactory
   */
  createComponents() {
    const componentFactory = this.factory.getComponentFactory();

    this.components.levelMenu = componentFactory.createComponent('levelMenu', {
      maxLevels: 5,
      onLevelSelect: (level) => this.handleLevelSelect(level)
    });

    this.components.chatMenu = componentFactory.createComponent('chatMenu', {
      onSendMessage: (message) => this.handleUserMessage(message)
    });

    this.components.navigation = componentFactory.createComponent('navigation');

    this.components.scoreDisplay = componentFactory.createComponent('scoreDisplay', {
      onLevelComplete: () => this.handleLevelComplete()
    });

    this.components.microphoneDisplay = componentFactory.createComponent('microphoneDisplay', {
      onRequestAccess: () => this.handleMicrophoneRequest()
    });

    // Initialize all components
    Object.values(this.components).forEach(component => {
      if (component && typeof component.init === 'function') {
        component.init();
      }
    });
  }

  /**
   * Setup interactions between components
   */
  setupInteractions() {
    // Setup audio service callback with timing analysis
    let lastTimingAnalysis = null;
    let lastFeedbackTime = 0;
    
    this.services.audio.setUpdateCallback((audioData) => {
      this.components.microphoneDisplay.updateVisualization(audioData);
      
      // Analyze timing every 500ms
      const now = Date.now();
      if (!lastTimingAnalysis || now - lastTimingAnalysis > 500) {
        const timing = this.services.timingAnalysis.analyzeTiming(audioData, now);
        
        if (timing && timing.beatDetected) {
          this.updateScoreFromTiming(timing);
          
          // Provide feedback every 5 seconds if timing needs improvement
          if (now - lastFeedbackTime > 5000) {
            if (timing.accuracy < 70 || timing.consistency < 60) {
              this.provideTimingFeedback(timing);
              lastFeedbackTime = now;
            }
          }
        }
        
        lastTimingAnalysis = now;
      }
      
      // Still update score from mic for visualization
      this.updateScoreFromMic(audioData.average);
    });

    // Setup rating buttons if they exist
    this.setupRatingButtons();

    // Setup past button to show reviews
    this.setupPastButton();
  }
      
  /**
   * Setup past button to navigate to reviews view
   */
  setupPastButton() {
    const pastButton = document.getElementById('past-toggle');
    if (pastButton) {
      pastButton.addEventListener('click', () => {
        this.components.navigation.showReviewsView();
      });
    }
  }

  /**
   * Initialize services
   */
  async initializeServices() {
    // Initialize AI with loading overlay
    await this.initializeAI();

    // Setup microphone if needed
    // (microphone is activated on user request)
  }

  /**
   * Initialize AI system
   */
  async initializeAI() {
    console.log("Initializing AI system...");

    // Create loading overlay
    const overlay = this.createLoadingOverlay();
    document.body.appendChild(overlay);

    try {
      const result = await this.services.ai.initModels();

      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
        }, 500);
      }, 500);
  } catch (error) {
      console.error('Error initializing AI:', error);
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
    }
        }, 500);
      }, 500);
  }
}

/**
   * Create loading overlay
 */
  createLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'ai-loading-overlay';
  
  const loadingContent = document.createElement('div');
  loadingContent.className = 'ai-loading-content';
  
    // Add Loading text with animation
  const loadingText = document.createElement('div');
  loadingText.className = 'ai-loading-text';
    loadingText.innerHTML = 'Loading<span class="loading-dots"></span>';
  
  loadingContent.appendChild(loadingText);
  overlay.appendChild(loadingContent);
  
    // Add styles if not already present
    if (!document.querySelector('#ai-loading-styles')) {
  const style = document.createElement('style');
      style.id = 'ai-loading-styles';
      style.textContent = this.getLoadingStyles();
      document.head.appendChild(style);
    }

    return overlay;
  }

  /**
   * Get loading styles
   */
  getLoadingStyles() {
    return `
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
    .ai-loading-text {
        color: #357abd;
        font-size: 32px;
        font-weight: 700;
        font-family: 'Fredoka', sans-serif;
        text-align: center;
        margin: 0;
        padding: 0;
        display: block;
    }
      .ai-loading-text .loading-dots::after {
        content: '.';
        animation: loading-dots 1.5s steps(4, end) infinite;
    }
      @keyframes loading-dots {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60% { content: '...'; }
        80%, 100% { content: ''; }
      }
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
  }

  /**
   * Handle level selection
   */
  handleLevelSelect(level) {
    this.models.progress.setLevel(level);
    this.models.progress.resetScore();
    this.components.scoreDisplay.updateLevel(level, this.models.progress.maxLevel);
    this.components.scoreDisplay.resetScore();
    this.saveData();
}

/**
   * Handle user message
   */
  async handleUserMessage(message) {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.models.conversation.setProcessing(true);
    this.models.conversation.addMessage(message, 'user');
    this.models.conversation.setConversationMode(true);

    this.components.chatMenu.addMessage(message, 'user');

    // Special command: clear conversation
    if (message.toLowerCase() === 'clear' || message.toLowerCase() === 'clear conversation') {
      this.models.conversation.clearMessages();
      this.components.chatMenu.clearMessages();
      this.components.chatMenu.addMessage("I've cleared our conversation. What would you like to talk about now?", 'ai');
      this.isProcessing = false;
      this.models.conversation.setProcessing(false);
        return;
    }
    
    // Show typing indicator
    this.components.chatMenu.showTypingIndicator('Analyzing');
    
    setTimeout(async () => {
      try {
        this.components.chatMenu.showTypingIndicator('Thinking');
        
        // Get conversation history for context
        const conversationHistory = this.models.conversation.getMessages();
        const response = await this.services.ai.generateResponse(message, conversationHistory);
        this.models.conversation.addMessage(response, 'ai');

        this.components.chatMenu.hideTypingIndicator();
        setTimeout(() => {
          this.components.chatMenu.addMessage(response, 'ai');
          this.isProcessing = false;
          this.models.conversation.setProcessing(false);
          this.saveData();
        }, 300);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const fallback = "I'm having a bit of trouble with my thinking cap right now. Try asking about specific rhythm techniques you want to improve!";
        this.components.chatMenu.hideTypingIndicator();
        this.components.chatMenu.addMessage(fallback, 'ai');
        this.isProcessing = false;
        this.models.conversation.setProcessing(false);
      }
    }, 600);
}

/**
   * Handle microphone request
 */
  async handleMicrophoneRequest() {
    const micDisplay = this.components.microphoneDisplay;
    micDisplay.setStatus("Requesting...");

    const success = await this.services.audio.requestAccess();
    if (success) {
      micDisplay.setStatus("Active");
    } else {
      micDisplay.setStatus("Access denied");
  }
}

  /**
   * Update score from microphone input
   */
  updateScoreFromMic(micValue) {
    const score = Math.min(Math.round((micValue / 255) * 100), 100);
    this.models.progress.setScore(score);
    this.components.scoreDisplay.updateScore(score);
  }

  /**
   * Update score from timing analysis
   * @param {Object} timing - Timing analysis results
   */
  updateScoreFromTiming(timing) {
    // Update score based on timing accuracy
    // Combine accuracy and consistency for better scoring
    const combinedScore = Math.round((timing.accuracy + timing.consistency) / 2);
    
    if (combinedScore > 0) {
      // Only update if we have valid timing data
      const currentScore = this.models.progress.getScore();
      const newScore = Math.min(currentScore + Math.floor(combinedScore / 20), 100);
      this.models.progress.setScore(newScore);
      this.components.scoreDisplay.updateScore(newScore);
    }
  }

  /**
   * Provide timing feedback using AI
   * @param {Object} timing - Timing analysis results
   */
  async provideTimingFeedback(timing) {
    if (this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      this.components.chatMenu.showTypingIndicator('Analyzing your rhythm');
      
      setTimeout(async () => {
        try {
          this.components.chatMenu.showTypingIndicator('Getting feedback');
          
          const feedback = await this.services.ai.generateTimingFeedback(timing);
          
          this.components.chatMenu.hideTypingIndicator();
          this.components.chatMenu.addMessage(feedback, 'ai');
          this.isProcessing = false;
        } catch (error) {
          console.error('Error getting timing feedback:', error);
          this.components.chatMenu.hideTypingIndicator();
          // Use fallback feedback
          const fallback = this.services.ai.getTimingFallbackFeedback(timing);
          this.components.chatMenu.addMessage(fallback, 'ai');
          this.isProcessing = false;
        }
      }, 600);
    } catch (error) {
      console.error('Error providing timing feedback:', error);
      this.isProcessing = false;
    }
  }

  /**
   * Update progress
   */
  updateProgress(amount) {
    const newScore = this.models.progress.updateScore(amount);
    this.components.scoreDisplay.updateScore(newScore);
    this.saveData();
}

/**
   * Handle level completion
 */
  async handleLevelComplete() {
    const level = this.models.progress.getLevel();
    const score = this.models.progress.getScore();

    // Add review
    this.models.review.addReview(level, score);
    this.updateReviewsDisplay();

    // Get celebration message
    if (this.isProcessing) {
      this.components.chatMenu.addMessage("Congratulations! You've completed this level!", 'ai');
    return;
  }
  
    this.isProcessing = true;
    this.components.chatMenu.showTypingIndicator('Celebrating');

    setTimeout(async () => {
      try {
        const prompt = "I just completed a level in my rhythm practice! Give me an encouraging message.";
        const response = await this.services.ai.generateResponse(prompt);
        this.components.chatMenu.hideTypingIndicator();
        this.components.chatMenu.addMessage(response, 'ai');
        this.isProcessing = false;
  
        // Update level
        const newLevel = this.models.progress.incrementLevel();
        this.components.scoreDisplay.updateLevel(newLevel, this.models.progress.maxLevel);

        // Reset score after delay
        setTimeout(() => {
          this.models.progress.resetScore();
          this.components.scoreDisplay.resetScore();
          this.saveData();
        }, 5000);
      } catch (error) {
        console.error('Error getting celebration message:', error);
        this.components.chatMenu.hideTypingIndicator();
        this.components.chatMenu.addMessage("Congratulations! You've completed this level!", 'ai');
        this.isProcessing = false;
      }
    }, 600);
  }

  /**
   * Update reviews display
   */
  updateReviewsDisplay() {
    const reviewsList = document.getElementById('reviews-list-full');
    if (!reviewsList) return;

    const reviews = this.models.review.getReviews();
    const latestReview = reviews[0];
    if (!latestReview) return;

    const newReview = document.createElement('div');
    newReview.className = 'review-item';
    newReview.innerHTML = `
      <div class="review-header">
        <span class="review-level">Level ${latestReview.level}</span>
        <span class="review-score">${latestReview.score}%</span>
      </div>
      <div class="review-date">${latestReview.date}</div>
    `;

    reviewsList.insertBefore(newReview, reviewsList.firstChild);
}

/**
   * Setup rating buttons
 */
  setupRatingButtons() {
  const thumbUp = document.querySelector('.thumb-up');
  const thumbDown = document.querySelector('.thumb-down');
  
  if (thumbUp) {
      thumbUp.addEventListener('click', () => {
        if (this.isProcessing) return;
        this.updateProgress(15);
        if (this.models.conversation.getConversationMode()) {
          this.handleUserMessage("That was helpful, thanks!");
      } else {
          this.handleFeedbackRequest(true);
      }
    });
  }
  
  if (thumbDown) {
      thumbDown.addEventListener('click', () => {
        if (this.isProcessing) return;
        if (this.models.conversation.getConversationMode()) {
          this.handleUserMessage("I'm still having trouble understanding. Can you explain differently?");
      } else {
          this.handleFeedbackRequest(false);
      }
    });
  }
}

/**
   * Handle feedback request
 */
  async handleFeedbackRequest(isPositive) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const prompts = isPositive
      ? [
    "Tell me what I did well in my rhythm practice",
    "What aspects of my rhythm playing are improving?", 
          "Give me specific positive feedback on my rhythm skills"
        ]
      : [
    "Tell me how I can improve my rhythm skills",
    "What should I focus on to get better at rhythm?",
          "Give me a specific way to improve my rhythm practice"
  ];
  
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    this.components.chatMenu.showTypingIndicator(isPositive ? 'Analyzing your progress' : 'Analyzing your practice');

    setTimeout(async () => {
      try {
        this.components.chatMenu.showTypingIndicator('Thinking');
        const response = await this.services.ai.generateResponse(prompt);
        this.components.chatMenu.hideTypingIndicator();
        this.components.chatMenu.addMessage(response, 'ai');
        this.isProcessing = false;
      } catch (error) {
        console.error('Error getting feedback:', error);
        const fallback = isPositive
          ? "You're doing great keeping the beat! Your rhythm is getting better with practice."
          : "Try focusing on counting out loud while you practice - it can help you stay on beat.";
        this.components.chatMenu.hideTypingIndicator();
        this.components.chatMenu.addMessage(fallback, 'ai');
        this.isProcessing = false;
      }
    }, 800);
  }

  /**
   * Save data to storage
   */
  saveData() {
    this.services.storage.saveProgress(this.models.progress.toJSON());
    this.services.storage.saveConversation(this.models.conversation.toJSON());
    this.services.storage.saveReviews(this.models.review.toJSON());
}

/**
   * Load saved data
   */
  loadSavedData() {
    // Data is already loaded in createModels()
    // Update UI with loaded data
    if (this.models.progress) {
      this.components.scoreDisplay.updateLevel(
        this.models.progress.getLevel(),
        this.models.progress.maxLevel
      );
      this.components.scoreDisplay.updateScore(this.models.progress.getScore());
    }

    // Load reviews
    const reviews = this.models.review.getReviews();
    const reviewsList = document.getElementById('reviews-list-full');
    if (reviewsList && reviews.length > 0) {
      reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-item';
        reviewElement.innerHTML = `
          <div class="review-header">
            <span class="review-level">Level ${review.level}</span>
            <span class="review-score">${review.score}%</span>
          </div>
          <div class="review-date">${review.date}</div>
        `;
        reviewsList.appendChild(reviewElement);
      });
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new PicksyApp();
  app.initialize();
});
