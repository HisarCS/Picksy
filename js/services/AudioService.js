/**
 * Audio Service - Handles microphone access and audio analysis
 */
class AudioService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.isActive = false;
    this.animationFrameId = null;
    this.onUpdateCallback = null;
  }

  /**
   * Request microphone access
   * @returns {Promise<boolean>}
   */
  async requestAccess() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      this.isActive = true;
      this.startVisualization();
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.isActive = false;
      return false;
    }
  }

  /**
   * Start audio visualization loop
   */
  startVisualization() {
    if (!this.isActive || !this.analyser) return;
    
    const update = () => {
      if (!this.isActive) return;
      
      this.analyser.getByteFrequencyData(this.dataArray);
      
      const average = Array.from(this.dataArray).reduce((sum, value) => sum + value, 0) / this.dataArray.length;
      
      if (this.onUpdateCallback) {
        this.onUpdateCallback({
          average: average,
          dataArray: Array.from(this.dataArray)
        });
      }
      
      this.animationFrameId = requestAnimationFrame(update);
    };
    
    update();
  }

  /**
   * Stop audio visualization
   */
  stopVisualization() {
    this.isActive = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Set update callback
   * @param {Function} callback
   */
  setUpdateCallback(callback) {
    this.onUpdateCallback = callback;
  }

  /**
   * Get current audio data
   * @returns {Object|null}
   */
  getAudioData() {
    if (!this.isActive || !this.analyser || !this.dataArray) {
      return null;
    }
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const average = Array.from(this.dataArray).reduce((sum, value) => sum + value, 0) / this.dataArray.length;
    
    return {
      average: average,
      dataArray: Array.from(this.dataArray)
    };
  }

  /**
   * Check if microphone is active
   * @returns {boolean}
   */
  getActive() {
    return this.isActive;
  }
}

export default AudioService;

