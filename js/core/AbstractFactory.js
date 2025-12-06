/**
 * Abstract Factory Pattern - Base Factory Interface
 * Defines the contract for all factories in the application
 */
class AbstractFactory {
  /**
   * Create a component instance
   * @param {string} type - Type of component to create
   * @param {Object} config - Configuration for the component
   * @returns {Object} Component instance
   */
  createComponent(type, config) {
    throw new Error('createComponent must be implemented by subclass');
  }

  /**
   * Create a service instance
   * @param {string} type - Type of service to create
   * @param {Object} config - Configuration for the service
   * @returns {Object} Service instance
   */
  createService(type, config) {
    throw new Error('createService must be implemented by subclass');
  }

  /**
   * Create a model instance
   * @param {string} type - Type of model to create
   * @param {Object} data - Data for the model
   * @returns {Object} Model instance
   */
  createModel(type, data) {
    throw new Error('createModel must be implemented by subclass');
  }
}

export default AbstractFactory;

