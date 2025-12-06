/**
 * Storage Service - Handles local storage operations
 */
class StorageService {
  constructor() {
    this.storageKey = 'picksy-app-data';
  }

  /**
   * Save data to local storage
   * @param {string} key - Storage key
   * @param {Object} data - Data to save
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving to storage:', error);
      return false;
    }
  }

  /**
   * Load data from local storage
   * @param {string} key - Storage key
   * @returns {Object|null}
   */
  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }

  /**
   * Remove data from local storage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from storage:', error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Save progress data
   * @param {Object} progressData
   */
  saveProgress(progressData) {
    const data = this.load(this.storageKey) || {};
    data.progress = progressData;
    return this.save(this.storageKey, data);
  }

  /**
   * Load progress data
   * @returns {Object|null}
   */
  loadProgress() {
    const data = this.load(this.storageKey);
    return data ? data.progress : null;
  }

  /**
   * Save conversation data
   * @param {Object} conversationData
   */
  saveConversation(conversationData) {
    const data = this.load(this.storageKey) || {};
    data.conversation = conversationData;
    return this.save(this.storageKey, data);
  }

  /**
   * Load conversation data
   * @returns {Object|null}
   */
  loadConversation() {
    const data = this.load(this.storageKey);
    return data ? data.conversation : null;
  }

  /**
   * Save reviews data
   * @param {Object} reviewsData
   */
  saveReviews(reviewsData) {
    const data = this.load(this.storageKey) || {};
    data.reviews = reviewsData;
    return this.save(this.storageKey, data);
  }

  /**
   * Load reviews data
   * @returns {Object|null}
   */
  loadReviews() {
    const data = this.load(this.storageKey);
    return data ? data.reviews : null;
  }
}

export default StorageService;

