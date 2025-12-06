/**
 * Navigation Component - Handles view navigation
 */
class Navigation {
  constructor() {
    this.mainView = null;
    this.reviewsView = null;
    this.backButton = null;
  }

  /**
   * Initialize navigation
   */
  init() {
    this.backButton = document.getElementById('back-button');
    this.mainView = document.querySelector('.main-view');
    this.reviewsView = document.getElementById('reviews-view');

    if (this.backButton) {
      this.backButton.addEventListener('click', () => {
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
    if (this.reviewsView) {
      this.reviewsView.style.display = 'flex';
    }
  }
}

export default Navigation;

