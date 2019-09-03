import { Injectable } from '@angular/core';
import { default as evaluations } from 'src/app/models/evaulations.ce.json';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import { default as reviews } from 'src/app/models/reviews.ce.json';
import { Extraction, Model, parseJson } from '../models/canonical';
import { DefaultStorage, SortStateManager, StateManager } from './state-manager';

export enum DemoModel {
  Foursquare,
  Reviews,
  Evaluations
}

// TODO: implement StateManagers for relevant classes.
@Injectable({
  providedIn: 'root'
})
export class StateService {
  // TODO: Create ModelStateManager
  /** The key under which the dataset id is stored in the Session Storage. */
  static readonly ModelIdKey = 'cv_dataset_id';

  private readonly _storage = DefaultStorage;

  private _modelId: string;
  private _model: Model;

  public sort: SortStateManager = new SortStateManager();
  public search: StateManager<string> = new StateManager<string>('search', '');

  constructor() {
  }

  get model(): Model { return this._model; }
  get modelId(): string { return this._modelId; }
  get hasModel(): boolean { return this._model !== undefined; }


  /**
   * Generates a model from the given extractions and updates the stored model id.
   */
  generateModel(extractions: Extraction[], id: string) {
    this._model = new Model(extractions);
    this._modelId = id;
    this._storage.setItem(StateService.ModelIdKey, id);
  }

  generateModelFromJson(json: any[]): void {
    const extractions = parseJson(json);
    const id = 'custom_json_model';
    this.generateModel(extractions, id);
  }

  /**
   * Loads the specified demo model and updates session storage with the model id.
   */
  loadDemoModel(model: DemoModel) {
    const extractions = this.getDemoModelExtractions(model);
    const id = DemoModel[model];
    this.generateModel(extractions, id);
  }

  private getDemoModelExtractions(model: DemoModel): Extraction[] {
    switch (model) {
      case DemoModel.Foursquare: { return parseJson(foursquare); }
      case DemoModel.Reviews: { return parseJson(reviews); }
      case DemoModel.Evaluations: { return parseJson(evaluations); }
    }

    throw new Error('Tried to load invalid Demo Model!');
  }

  /**
   * Tries to load a model from storage.
   * Throws an error if loading fails.
   */
  loadModelFromStorage() {
    const storedId = this._storage.getItem(StateService.ModelIdKey);

    // load demo model if demo model was stored.
    const demoModel = DemoModel[storedId];

    // throw error if stored model is not a demo model, since custom models not implemented yet.
    if (demoModel === undefined) {
      throw new Error(`Stored model '${storedId}' could be loaded, as it is no valid demo model.`);
    }

    this.loadDemoModel(demoModel);
  }

  /**
   * Loads a model in the service, if no model is available, guaranteeing that some model is available.
   *
   * The following strategies are persued, in case no model is currently loaded:
   * 1. Try to load model from storage.
   * 2. Load 'Foursquare' demo dataset.
   */
  ensureModelIsAvailable() {
    if (!this.hasModel) {
      console.warn('service holds no model. trying to load a model from storage...');
      try {
        this.loadModelFromStorage();
        console.log(`restored "${this.modelId}" model from storage!`);
      } catch (error) {
        console.error('could not restore model from storage, reason:');
        console.error(error);
        console.log('loading "Foursquare" model instead');
        this.loadDemoModel(DemoModel.Foursquare);
      }
    }
  }
}
