/**
 * Progress Model - Manages user progress data
 */
class ProgressModel {
  constructor(data = {}) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.maxLevel = data.maxLevel || 5;
    this.maxScore = 100;
  }

  /**
   * Update the current score
   * @param {number} amount - Amount to add to score
   * @returns {number} New score value
   */
  updateScore(amount) {
    this.score = Math.min(this.score + amount, this.maxScore);
    return this.score;
  }

  /**
   * Set the score directly
   * @param {number} score - Score value (0-100)
   */
  setScore(score) {
    this.score = Math.max(0, Math.min(score, this.maxScore));
  }

  /**
   * Update the level
   * @param {number} level - Level number
   */
  setLevel(level) {
    this.level = Math.max(1, Math.min(level, this.maxLevel));
  }

  /**
   * Increment level
   * @returns {number} New level
   */
  incrementLevel() {
    if (this.level < this.maxLevel) {
      this.level++;
    }
    return this.level;
  }

  /**
   * Reset score to 0
   */
  resetScore() {
    this.score = 0;
  }

  /**
   * Check if level is complete (score >= 100)
   * @returns {boolean}
   */
  isLevelComplete() {
    return this.score >= this.maxScore;
  }

  /**
   * Get current level
   * @returns {number}
   */
  getLevel() {
    return this.level;
  }

  /**
   * Get current score
   * @returns {number}
   */
  getScore() {
    return this.score;
  }

  /**
   * Get progress as object
   * @returns {Object}
   */
  toJSON() {
    return {
      level: this.level,
      score: this.score,
      maxLevel: this.maxLevel,
      maxScore: this.maxScore
    };
  }
}

export default ProgressModel;

