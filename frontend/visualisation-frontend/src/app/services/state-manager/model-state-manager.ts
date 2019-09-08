import { Model } from '../../models/canonical';
import { StateManager, DefaultStorage } from './state-manager';
import { DemoModels, DemoModel } from '../../models/demo';

export class ModelStateManager extends StateManager<Model> {

  get modelId(): string {
    return this.state.id;
  }

  get model(): Model {
    return this.state;
  }

  constructor(name = 'model_id', defaultValue = null, storage: Storage = DefaultStorage) {
    super(name, defaultValue, storage);
    this.deserializer = this.readFromId;
    this.serializer = (state: Model) => this.modelId;
    this._defaultValue = DemoModels.getModel(DemoModel.Foursquare);
  }

  readFromId(id: string): Model {
    // load demo model if demo model was stored.
    if (DemoModels.isValidId(id)) {
      return DemoModels.fromId(id);
    }
    return this.readCustomModelFromId(id);
  }

  // TODO: implement?
  /**
   * Tries to read a custom model using the given id.\
   * Throws an error if reading fails.
   */
  readCustomModelFromId(id: string): Model {
    throw new Error(`Could not load model with id ${id}. Custom model loading not implemented yet.`);
  }
}
