import AbstractFactory from '../core/AbstractFactory.js';
import AIService from '../services/AIService.js';
import AudioService from '../services/AudioService.js';
import StorageService from '../services/StorageService.js';
import TimingAnalysisService from '../services/TimingAnalysisService.js';

/**
 * Service Factory - Creates service instances
 */
class ServiceFactory extends AbstractFactory {
  constructor() {
    super();
    this.services = new Map();
  }

  /**
   * Create a service instance
   * @param {string} type - Type of service ('ai', 'audio', 'storage', 'timingAnalysis')
   * @param {Object} config - Configuration for the service
   * @returns {Object} Service instance
   */
  createService(type, config = {}) {
    let service;

    switch (type) {
      case 'ai':
        service = new AIService(config);
        break;
      case 'audio':
        service = new AudioService(config);
        break;
      case 'storage':
        service = new StorageService(config);
        break;
      case 'timingAnalysis':
        service = new TimingAnalysisService(config);
        break;
      default:
        throw new Error(`Unknown service type: ${type}`);
    }

    this.services.set(type, service);
    return service;
  }

  /**
   * Get a service by type
   * @param {string} type - Service type
   * @returns {Object|null}
   */
  getService(type) {
    return this.services.get(type) || null;
  }

  /**
   * Create a component instance (not implemented in ServiceFactory)
   */
  createComponent(type, config) {
    throw new Error('ServiceFactory does not create components');
  }

  /**
   * Create a model instance (not implemented in ServiceFactory)
   */
  createModel(type, data) {
    throw new Error('ServiceFactory does not create models');
  }
}

export default ServiceFactory;

