/**
 * Score Display Component - Handles score bar UI
 */
class ScoreDisplay {
  constructor(config = {}) {
    this.scoreFill = null;
    this.scoreValue = null;
    this.levelValue = null;
    this.onLevelComplete = config.onLevelComplete || null;
  }

  /**
   * Initialize the score display
   */
  init() {
    this.scoreFill = document.getElementById('score-fill');
    this.scoreValue = document.getElementById('score-value');
    this.levelValue = document.querySelector('.level-value');
  }

  /**
   * Update the score
   * @param {number} score - Score value (0-100)
   */
  updateScore(score) {
    if (this.scoreFill) {
      this.scoreFill.style.transition = 'width 0.3s ease';
      this.scoreFill.style.width = `${score}%`;
    }

    if (this.scoreValue) {
      this.scoreValue.textContent = `${score}%`;
    }

    if (score >= 100 && this.onLevelComplete) {
      this.onLevelComplete();
    }
  }

  /**
   * Update the level with animation
   * @param {number} level - Level number
   * @param {number} maxLevel - Maximum level
   */
  updateLevel(level, maxLevel = 5) {
    if (this.levelValue) {
      const oldLevel = this.getLevel();
      
      // Animate level change if it actually changed
      if (oldLevel !== level) {
        this.animateLevelChange(level, maxLevel);
      } else {
        // Just update without animation if same level
        this.levelValue.textContent = `${level}/${maxLevel}`;
      }
    }
  }

  /**
   * Animate level change - change happens at the peak of the animation
   * @param {number} level - New level number
   * @param {number} maxLevel - Maximum level
   */
  animateLevelChange(level, maxLevel) {
    if (!this.levelValue) return;

    // Start animation first
    this.levelValue.classList.add('level-changing');
    
    // Change the text content exactly at the peak (50% = 300ms of 600ms animation)
    // This is when scale is at maximum (1.4x) - right at the peak of amplification
    setTimeout(() => {
      if (this.levelValue) {
        this.levelValue.textContent = `${level}/${maxLevel}`;
      }
    }, 300); // Exactly at the peak (50% of 600ms animation)
    
    // Remove class after animation completes
    setTimeout(() => {
      if (this.levelValue) {
        this.levelValue.classList.remove('level-changing');
      }
    }, 600);
  }

  /**
   * Reset the score
   */
  resetScore() {
    if (this.scoreFill) {
      this.scoreFill.style.transition = 'none';
      this.scoreFill.style.width = '0%';
      setTimeout(() => {
        if (this.scoreFill) {
          this.scoreFill.style.transition = 'width 0.3s ease';
        }
      }, 50);
    }

    if (this.scoreValue) {
      this.scoreValue.textContent = '0%';
    }
  }

  /**
   * Get current score
   * @returns {number}
   */
  getScore() {
    if (this.scoreValue) {
      return parseInt(this.scoreValue.textContent) || 0;
    }
    return 0;
  }

  /**
   * Get current level
   * @returns {number}
   */
  getLevel() {
    if (this.levelValue) {
      const match = this.levelValue.textContent.match(/(\d+)\/(\d+)/);
      return match ? parseInt(match[1]) : 1;
    }
    return 1;
  }

  /**
   * Set level complete callback
   * @param {Function} callback
   */
  setOnLevelComplete(callback) {
    this.onLevelComplete = callback;
  }
}

export default ScoreDisplay;

