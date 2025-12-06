import AbstractFactory from '../core/AbstractFactory.js';
import LevelMenu from '../components/LevelMenu.js';
import ChatMenu from '../components/ChatMenu.js';
import Navigation from '../components/Navigation.js';
import ScoreDisplay from '../components/ScoreDisplay.js';
import MicrophoneDisplay from '../components/MicrophoneDisplay.js';

/**
 * Component Factory - Creates UI components
 */
class ComponentFactory extends AbstractFactory {
  constructor() {
    super();
    this.components = new Map();
  }

  /**
   * Create a component instance
   * @param {string} type - Type of component ('levelMenu', 'chatMenu', 'navigation', 'scoreDisplay', 'microphoneDisplay')
   * @param {Object} config - Configuration for the component
   * @returns {Object} Component instance
   */
  createComponent(type, config = {}) {
    let component;

    switch (type) {
      case 'levelMenu':
        component = new LevelMenu(config);
        break;
      case 'chatMenu':
        component = new ChatMenu(config);
        break;
      case 'navigation':
        component = new Navigation(config);
        break;
      case 'scoreDisplay':
        component = new ScoreDisplay(config);
        break;
      case 'microphoneDisplay':
        component = new MicrophoneDisplay(config);
        break;
      default:
        throw new Error(`Unknown component type: ${type}`);
    }

    this.components.set(type, component);
    return component;
  }

  /**
   * Get a component by type
   * @param {string} type - Component type
   * @returns {Object|null}
   */
  getComponent(type) {
    return this.components.get(type) || null;
  }

  /**
   * Create a service instance (not implemented in ComponentFactory)
   */
  createService(type, config) {
    throw new Error('ComponentFactory does not create services');
  }

  /**
   * Create a model instance (not implemented in ComponentFactory)
   */
  createModel(type, data) {
    throw new Error('ComponentFactory does not create models');
  }
}

export default ComponentFactory;

