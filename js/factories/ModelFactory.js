import AbstractFactory from '../core/AbstractFactory.js';
import ProgressModel from '../models/ProgressModel.js';
import ConversationModel from '../models/ConversationModel.js';
import ReviewModel from '../models/ReviewModel.js';

/**
 * Model Factory - Creates data model instances
 */
class ModelFactory extends AbstractFactory {
  constructor() {
    super();
    this.models = new Map();
  }

  /**
   * Create a model instance
   * @param {string} type - Type of model ('progress', 'conversation', 'review')
   * @param {Object} data - Data for the model
   * @returns {Object} Model instance
   */
  createModel(type, data = {}) {
    let model;

    switch (type) {
      case 'progress':
        model = new ProgressModel(data);
        break;
      case 'conversation':
        model = new ConversationModel(data);
        break;
      case 'review':
        model = new ReviewModel(data);
        break;
      default:
        throw new Error(`Unknown model type: ${type}`);
    }

    this.models.set(type, model);
    return model;
  }

  /**
   * Get a model by type
   * @param {string} type - Model type
   * @returns {Object|null}
   */
  getModel(type) {
    return this.models.get(type) || null;
  }

  /**
   * Create a component instance (not implemented in ModelFactory)
   */
  createComponent(type, config) {
    throw new Error('ModelFactory does not create components');
  }

  /**
   * Create a service instance (not implemented in ModelFactory)
   */
  createService(type, config) {
    throw new Error('ModelFactory does not create services');
  }
}

export default ModelFactory;

