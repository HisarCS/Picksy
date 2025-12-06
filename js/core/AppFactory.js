import ComponentFactory from '../factories/ComponentFactory.js';
import ServiceFactory from '../factories/ServiceFactory.js';
import ModelFactory from '../factories/ModelFactory.js';

/**
 * Application Factory - Main factory that coordinates all sub-factories
 * Implements the Abstract Factory pattern
 */
class AppFactory {
  constructor() {
    this.componentFactory = new ComponentFactory();
    this.serviceFactory = new ServiceFactory();
    this.modelFactory = new ModelFactory();
  }

  /**
   * Get component factory
   * @returns {ComponentFactory}
   */
  getComponentFactory() {
    return this.componentFactory;
  }

  /**
   * Get service factory
   * @returns {ServiceFactory}
   */
  getServiceFactory() {
    return this.serviceFactory;
  }

  /**
   * Get model factory
   * @returns {ModelFactory}
   */
  getModelFactory() {
    return this.modelFactory;
  }

  /**
   * Create a component
   * @param {string} type - Component type
   * @param {Object} config - Configuration
   * @returns {Object}
   */
  createComponent(type, config) {
    return this.componentFactory.createComponent(type, config);
  }

  /**
   * Create a service
   * @param {string} type - Service type
   * @param {Object} config - Configuration
   * @returns {Object}
   */
  createService(type, config) {
    return this.serviceFactory.createService(type, config);
  }

  /**
   * Create a model
   * @param {string} type - Model type
   * @param {Object} data - Data
   * @returns {Object}
   */
  createModel(type, data) {
    return this.modelFactory.createModel(type, data);
  }
}

export default AppFactory;

