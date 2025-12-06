/**
 * Microphone Display Component - Handles microphone visualization UI
 */
class MicrophoneDisplay {
  constructor(config = {}) {
    this.micValue = null;
    this.micBars = null;
    this.micBarsContainer = null;
    this.onRequestAccess = config.onRequestAccess || null;
  }

  /**
   * Initialize the microphone display
   */
  init() {
    this.micValue = document.getElementById('mic-value');
    this.micBarsContainer = document.getElementById('mic-bars');

    if (this.micValue) {
      this.setupMicValue();
    }

    if (this.micBarsContainer) {
      this.createMicBars();
    }
  }

  /**
   * Setup microphone value element
   */
  setupMicValue() {
    this.micValue.textContent = "Click to enable";
    this.micValue.style.cursor = 'pointer';
    this.micValue.setAttribute('role', 'button');
    this.micValue.setAttribute('tabindex', '0');
    this.micValue.setAttribute('aria-label', 'Click to enable microphone');

    this.micValue.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.onRequestAccess) {
        this.onRequestAccess();
      }
    });

    this.micValue.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onRequestAccess) {
          this.onRequestAccess();
        }
      }
    });

    this.micValue.addEventListener('mousedown', () => {
      this.micValue.style.transform = 'scale(0.95)';
    });

    this.micValue.addEventListener('mouseup', () => {
      this.micValue.style.transform = 'scale(1.05)';
    });
  }

  /**
   * Create microphone bars
   */
  createMicBars() {
    if (!this.micBarsContainer) return;

    for (let i = 0; i < 32; i++) {
      const bar = document.createElement('div');
      bar.className = 'mic-bar';
      this.micBarsContainer.appendChild(bar);
    }

    this.micBars = this.micBarsContainer.querySelectorAll('.mic-bar');
  }

  /**
   * Update microphone visualization
   * @param {Object} audioData - Audio data with average and dataArray
   */
  updateVisualization(audioData) {
    if (!audioData) return;

    if (this.micValue) {
      this.micValue.textContent = Math.round(audioData.average);
    }

    if (this.micBars && audioData.dataArray) {
      for (let i = 0; i < this.micBars.length; i++) {
        const index = Math.floor(i * (audioData.dataArray.length / this.micBars.length));
        const value = audioData.dataArray[index];
        const height = Math.max((value / 255) * 100, 5);
        this.micBars[i].style.height = `${height}%`;
      }
    }
  }

  /**
   * Set microphone status
   * @param {string} status - Status text
   */
  setStatus(status) {
    if (this.micValue) {
      this.micValue.textContent = status;
    }
  }

  /**
   * Set request access callback
   * @param {Function} callback
   */
  setOnRequestAccess(callback) {
    this.onRequestAccess = callback;
  }
}

export default MicrophoneDisplay;

