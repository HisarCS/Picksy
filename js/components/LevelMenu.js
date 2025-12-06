/**
 * Level Menu Component - Handles level selection menu UI
 */
class LevelMenu {
  constructor(config = {}) {
    this.menuElement = null;
    this.onLevelSelect = config.onLevelSelect || null;
    this.maxLevels = config.maxLevels || 5;
  }

  /**
   * Initialize the level menu
   */
  init() {
    const menuButton = document.querySelector('.menu-toggle');
    if (!menuButton) {
      console.error('Menu toggle button not found');
      return;
    }

    this.createMenu();
    this.attachEventListeners(menuButton);
  }

  /**
   * Create the menu DOM structure
   */
  createMenu() {
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'level-menu';

    const menuHeader = document.createElement('div');
    menuHeader.className = 'menu-header';
    menuHeader.innerHTML = `
      <h3>Select Level</h3>
      <button class="menu-close">×</button>
    `;

    const levelList = document.createElement('div');
    levelList.className = 'level-list';

    for (let i = 1; i <= this.maxLevels; i++) {
      const levelItem = document.createElement('div');
      levelItem.className = 'level-item';
      levelItem.dataset.level = i;
      levelItem.innerHTML = `
        <span class="level-number">${i}</span>
      `;

      levelItem.addEventListener('click', () => {
        this.selectLevel(i);
        this.close();
      });

      levelList.appendChild(levelItem);
    }

    this.menuElement.appendChild(menuHeader);
    this.menuElement.appendChild(levelList);
    document.body.appendChild(this.menuElement);
  }

  /**
   * Attach event listeners
   * @param {HTMLElement} menuButton
   */
  attachEventListeners(menuButton) {
    menuButton.addEventListener('click', () => {
      this.open();
    });

    const closeButton = this.menuElement.querySelector('.menu-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.close();
      });
    }

    this.menuElement.addEventListener('click', (e) => {
      if (e.target === this.menuElement) {
        this.close();
      }
    });
  }

  /**
   * Open the menu
   */
  open() {
    if (this.menuElement) {
      this.menuElement.classList.add('open');
    }
  }

  /**
   * Close the menu
   */
  close() {
    if (this.menuElement) {
      this.menuElement.classList.remove('open');
    }
  }

  /**
   * Select a level
   * @param {number} level
   */
  selectLevel(level) {
    const levelItems = this.menuElement.querySelectorAll('.level-item');
    levelItems.forEach((item, index) => {
      if (index + 1 === level) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    if (this.onLevelSelect) {
      this.onLevelSelect(level);
    }
  }

  /**
   * Set level select callback
   * @param {Function} callback
   */
  setOnLevelSelect(callback) {
    this.onLevelSelect = callback;
  }
}

export default LevelMenu;

