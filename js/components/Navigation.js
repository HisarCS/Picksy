/**
 * Navigation Component - Handles view navigation
 */
class Navigation {
  constructor() {
    this.mainView = null;
    this.reviewsView = null;
    this.feedbackView = null;
    this.backButton = null;
    this.feedbackBackButton = null;
  }

  /**
   * Initialize navigation
   */
  init() {
    this.backButton = document.getElementById('back-button');
    this.feedbackBackButton = document.getElementById('feedback-back-button');
    this.mainView = document.querySelector('.main-view');
    this.reviewsView = document.getElementById('reviews-view');
    this.feedbackView = document.getElementById('feedback-view');

    if (this.backButton) {
      this.backButton.addEventListener('click', () => {
        this.showMainView();
      });
    }

    if (this.feedbackBackButton) {
      this.feedbackBackButton.addEventListener('click', () => {
        this.showMainView();
      });
    }
  }

  /**
   * Show main view
   */
  showMainView() {
    if (this.reviewsView) {
      this.reviewsView.style.display = 'none';
    }
    if (this.feedbackView) {
      this.feedbackView.style.display = 'none';
    }
    if (this.mainView) {
      this.mainView.style.display = 'flex';
    }
  }

  /**
   * Show reviews view
   */
  showReviewsView() {
    if (this.mainView) {
      this.mainView.style.display = 'none';
    }
    if (this.feedbackView) {
      this.feedbackView.style.display = 'none';
    }
    if (this.reviewsView) {
      this.reviewsView.style.display = 'flex';
    }
  }

  /**
   * Show feedback view
   */
  showFeedbackView() {
    if (this.mainView) {
      this.mainView.style.display = 'none';
    }
    if (this.reviewsView) {
      this.reviewsView.style.display = 'none';
    }
    if (this.feedbackView) {
      this.feedbackView.style.display = 'flex';
    }
  }
}

export default Navigation;

