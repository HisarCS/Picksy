/**
 * Timing Analysis Service - Analyzes user's rhythm timing
 */
class TimingAnalysisService {
  constructor() {
    this.beatHistory = [];
    this.targetBPM = 120;
    this.beatThreshold = 50; // Minimum amplitude to detect a beat
    this.lastBeatTime = null;
    this.bpmHistory = [];
  }

  /**
   * Analyze timing from audio data
   * @param {Object} audioData - Audio data with average and dataArray
   * @param {number} timestamp - Current timestamp
   * @returns {Object} Timing analysis results
   */
  analyzeTiming(audioData, timestamp) {
    if (!audioData || !audioData.average) return null;

    // Detect beat (when audio amplitude exceeds threshold)
    const isBeat = this.detectBeat(audioData.average);
    
    if (isBeat) {
      if (this.lastBeatTime !== null) {
        const interval = timestamp - this.lastBeatTime;
        const bpm = this.calculateBPMFromInterval(interval);
        
        if (bpm > 60 && bpm < 200) { // Valid BPM range
          this.bpmHistory.push(bpm);
          if (this.bpmHistory.length > 10) {
            this.bpmHistory.shift();
          }
        }
      }
      this.lastBeatTime = timestamp;
      this.beatHistory.push(timestamp);
      
      // Keep only last 20 beats
      if (this.beatHistory.length > 20) {
        this.beatHistory.shift();
      }
    }

    // Calculate metrics
    const currentBPM = this.getCurrentBPM();
    const accuracy = this.calculateAccuracy(currentBPM);
    const consistency = this.calculateConsistency();

    return {
      bpm: currentBPM,
      targetBPM: this.targetBPM,
      accuracy: accuracy,
      consistency: consistency,
      isOnBeat: this.isOnBeat(currentBPM),
      beatDetected: isBeat
    };
  }

  /**
   * Detect if current audio sample is a beat
   */
  detectBeat(average) {
    return average > this.beatThreshold;
  }

  /**
   * Calculate BPM from time interval
   */
  calculateBPMFromInterval(intervalMs) {
    if (intervalMs <= 0) return 0;
    return Math.round(60000 / intervalMs); // Convert ms to BPM
  }

  /**
   * Get current BPM from history
   */
  getCurrentBPM() {
    if (this.bpmHistory.length === 0) return 0;
    
    const sum = this.bpmHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.bpmHistory.length);
  }

  /**
   * Calculate timing accuracy (how close to target BPM)
   */
  calculateAccuracy(currentBPM) {
    if (currentBPM === 0 || this.targetBPM === 0) return 0;
    
    const difference = Math.abs(currentBPM - this.targetBPM);
    const maxDifference = this.targetBPM * 0.5; // 50% tolerance
    const accuracy = Math.max(0, 100 - (difference / maxDifference * 100));
    
    return Math.round(accuracy);
  }

  /**
   * Calculate consistency (how steady the rhythm is)
   */
  calculateConsistency() {
    if (this.bpmHistory.length < 3) return 0;
    
    // Calculate standard deviation
    const mean = this.bpmHistory.reduce((a, b) => a + b, 0) / this.bpmHistory.length;
    const variance = this.bpmHistory.reduce((sum, bpm) => {
      return sum + Math.pow(bpm - mean, 2);
    }, 0) / this.bpmHistory.length;
    const stdDev = Math.sqrt(variance);
    
    // Convert to percentage (lower stdDev = higher consistency)
    const maxStdDev = 20; // Maximum expected deviation
    const consistency = Math.max(0, 100 - (stdDev / maxStdDev * 100));
    
    return Math.round(consistency);
  }

  /**
   * Check if user is on beat
   */
  isOnBeat(currentBPM) {
    const difference = Math.abs(currentBPM - this.targetBPM);
    return difference < (this.targetBPM * 0.1); // Within 10%
  }

  /**
   * Set target BPM
   */
  setTargetBPM(bpm) {
    this.targetBPM = bpm;
  }

  /**
   * Reset analysis
   */
  reset() {
    this.beatHistory = [];
    this.bpmHistory = [];
    this.lastBeatTime = null;
  }
}

export default TimingAnalysisService;

