/**
 * Chat Menu Component - Handles chat popup menu UI
 */
class ChatMenu {
  constructor(config = {}) {
    this.menuElement = null;
    this.messagesContainer = null;
    this.userInput = null;
    this.sendButton = null;
    this.onSendMessage = config.onSendMessage || null;
  }

  /**
   * Initialize the chat menu
   */
  init() {
    const chatToggle = document.getElementById('chat-toggle');
    if (!chatToggle) {
      console.error('Chat toggle button not found');
      return;
    }

    this.createMenu();
    this.attachEventListeners(chatToggle);
    this.setupChatInterface();
  }

  /**
   * Create the menu DOM structure
   */
  createMenu() {
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'chat-menu';

    const menuHeader = document.createElement('div');
    menuHeader.className = 'chat-menu-header';
    menuHeader.innerHTML = `
      <div class="chat-header-content">
        <img src="picksy.png" alt="Picksy" class="picksy-logo-small">
        <h3>Chat</h3>
      </div>
      <button class="chat-menu-close">×</button>
    `;

    this.messagesContainer = document.createElement('div');
    this.messagesContainer.className = 'chat-menu-messages';
    this.messagesContainer.id = 'chat-messages';
    this.messagesContainer.innerHTML = `
      <div class="message ai-message">
        <div class="message-content">
          <p>How can I help you with your rhythm practice?</p>
        </div>
      </div>
    `;

    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-menu-input-container';
    inputContainer.innerHTML = `
      <input type="text" id="user-input" placeholder="Type a message...">
      <button class="send-button">Send</button>
    `;

    this.menuElement.appendChild(menuHeader);
    this.menuElement.appendChild(this.messagesContainer);
    this.menuElement.appendChild(inputContainer);
    document.body.appendChild(this.menuElement);

    this.userInput = this.menuElement.querySelector('#user-input');
    this.sendButton = this.menuElement.querySelector('.send-button');
  }

  /**
   * Attach event listeners
   * @param {HTMLElement} chatToggle
   */
  attachEventListeners(chatToggle) {
    chatToggle.addEventListener('click', () => {
      this.open();
    });

    const closeButton = this.menuElement.querySelector('.chat-menu-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    this.menuElement.addEventListener('click', (e) => {
      if (e.target === this.menuElement) {
        this.close();
      }
    });
  }

  /**
   * Setup chat interface handlers
   */
  setupChatInterface() {
    if (!this.userInput || !this.sendButton) return;

    this.sendButton.addEventListener('click', () => {
      this.handleSend();
    });

    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSend();
      }
    });
  }

  /**
   * Handle send message
   */
  handleSend() {
    if (!this.userInput || !this.userInput.value.trim()) return;
    if (!this.onSendMessage) return;

    const message = this.userInput.value.trim();
    this.onSendMessage(message);
    this.userInput.value = '';
  }

  /**
   * Open the menu
   */
  open() {
    if (this.menuElement) {
      this.menuElement.classList.add('open');
    }
  }

  /**
   * Close the menu
   */
  close() {
    if (this.menuElement) {
      this.menuElement.classList.remove('open');
    }
  }

  /**
   * Add a message to the chat
   * @param {string} message - Message text
   * @param {string} type - Message type ('user' or 'ai')
   */
  addMessage(message, type = 'ai') {
    if (!this.messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${message}</p>
      </div>
    `;

    this.messagesContainer.appendChild(messageDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Show typing indicator
   * @param {string} status - Status text
   */
  showTypingIndicator(status = 'Thinking') {
    if (!this.messagesContainer) return;

    const existingTyping = this.messagesContainer.querySelector('.typing-indicator');
    if (existingTyping) {
      existingTyping.remove();
    }

    const typingMessage = document.createElement('div');
    typingMessage.className = 'message ai-message typing-indicator';
    typingMessage.innerHTML = `
      <div class="message-content">
        <p>${status} <span class='typing-dots'></span></p>
      </div>
    `;

    this.messagesContainer.appendChild(typingMessage);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    if (!this.messagesContainer) return;

    const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = '';
  }

  /**
   * Set send message callback
   * @param {Function} callback
   */
  setOnSendMessage(callback) {
    this.onSendMessage = callback;
  }
}

export default ChatMenu;

