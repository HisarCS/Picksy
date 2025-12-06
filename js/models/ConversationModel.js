/**
 * Conversation Model - Manages chat conversation data
 */
class ConversationModel {
  constructor(data = {}) {
    this.messages = data.messages || [];
    this.isProcessing = data.isProcessing || false;
    this.conversationMode = data.conversationMode || false;
  }

  /**
   * Add a message to the conversation
   * @param {string} message - Message text
   * @param {string} type - Message type ('user' or 'ai')
   */
  addMessage(message, type = 'ai') {
    this.messages.push({
      text: message,
      type: type,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    this.messages = [];
  }

  /**
   * Get all messages
   * @returns {Array}
   */
  getMessages() {
    return this.messages;
  }

  /**
   * Get last message
   * @returns {Object|null}
   */
  getLastMessage() {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
  }

  /**
   * Set processing state
   * @param {boolean} isProcessing
   */
  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;
  }

  /**
   * Get processing state
   * @returns {boolean}
   */
  getProcessing() {
    return this.isProcessing;
  }

  /**
   * Set conversation mode
   * @param {boolean} mode
   */
  setConversationMode(mode) {
    this.conversationMode = mode;
  }

  /**
   * Get conversation mode
   * @returns {boolean}
   */
  getConversationMode() {
    return this.conversationMode;
  }

  /**
   * Get conversation as object
   * @returns {Object}
   */
  toJSON() {
    return {
      messages: this.messages,
      isProcessing: this.isProcessing,
      conversationMode: this.conversationMode
    };
  }
}

export default ConversationModel;

