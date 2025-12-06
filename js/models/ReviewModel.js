/**
 * Review Model - Manages review/attempt history data
 */
class ReviewModel {
  constructor(data = {}) {
    this.reviews = data.reviews || [];
  }

  /**
   * Add a review entry
   * @param {number} level - Level number
   * @param {number} score - Score percentage
   * @param {string} date - Date string (optional)
   */
  addReview(level, score, date = null) {
    const review = {
      level: level,
      score: score,
      date: date || new Date().toISOString().split('T')[0]
    };
    this.reviews.unshift(review); // Add to beginning
    return review;
  }

  /**
   * Get all reviews
   * @returns {Array}
   */
  getReviews() {
    return this.reviews;
  }

  /**
   * Get reviews for a specific level
   * @param {number} level - Level number
   * @returns {Array}
   */
  getReviewsByLevel(level) {
    return this.reviews.filter(review => review.level === level);
  }

  /**
   * Get latest review
   * @returns {Object|null}
   */
  getLatestReview() {
    return this.reviews.length > 0 ? this.reviews[0] : null;
  }

  /**
   * Clear all reviews
   */
  clearReviews() {
    this.reviews = [];
  }

  /**
   * Get reviews as object
   * @returns {Object}
   */
  toJSON() {
    return {
      reviews: this.reviews
    };
  }
}

export default ReviewModel;

