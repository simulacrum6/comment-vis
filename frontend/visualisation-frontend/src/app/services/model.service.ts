import { Injectable } from '@angular/core';
import { Model, parseJson, Extraction } from '../models/canonical';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import { default as reviews } from 'src/app/models/reviews.ce.json';
import { default as evaluations } from 'src/app/models/evaulations.ce.json';

export enum DemoModel {
  Foursquare,
  Reviews,
  Evaluations
}

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  /** The key under which the model id is stored in the Session Storage. */
  static readonly ModelIdKey = 'cv_dataset_id';

  model: Model;

  private _modelId: string;

  get modelId(): string {
    return this._modelId;
  }

  get hasModel(): boolean {
    return this.model !== undefined;
  }

  constructor() { }

  generateModelFromJson(json: any[]): void {
    this.model = new Model(parseJson(json));
  }

  /**
   * Tries to load a model from the session storage.
   * Throws an error if loading fails.
   */
  loadModelFromSession() {
    const storedId = sessionStorage.getItem(ModelService.ModelIdKey);

    // load demo model if demo model was stored
    const demoModel = DemoModel[storedId];
    if (demoModel !== undefined) {
      this.loadDemoModel(demoModel);
    }

    // custom models not implemented yet
    throw new Error('No valid model could be loaded');
  }

  /**
   * Loads the specified demo model and updates session storage with the model id.
   */
  loadDemoModel(model: DemoModel) {
    const extractions = this.getDemoModelData(model);
    const id = DemoModel[model];
    this.model = new Model(extractions);
    this._modelId = id;
    sessionStorage.setItem(ModelService.ModelIdKey, id);
  }

  private getDemoModelData(model: DemoModel): Extraction[] {
    switch (model) {
      case DemoModel.Foursquare: { return parseJson(foursquare); }
      case DemoModel.Reviews: { return parseJson(reviews); }
      case DemoModel.Evaluations: { return parseJson(evaluations); }
    }

    throw new Error('Tried to load invalid Demo Model!');
  }
}
