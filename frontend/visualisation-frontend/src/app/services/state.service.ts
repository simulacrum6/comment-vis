import { Injectable } from '@angular/core';
import { StateManager } from './state-manager';
import { ModelStateManager } from './model-state-manager';
import { SortStateManager } from './sort-state-manager';
import { FacetType, FacetTypes } from '../models/canonical';
import { SimpleRoute } from '../models/utils';

const stats: SimpleRoute = { url: ['/stats/'], queryParams: {} };

// TODO: implement StateManagers for relevant classes.
// TODO: make StateService StateManager<AppState>
@Injectable({
  providedIn: 'root'
})
export class StateService {

  private managers: StateManager<any>[];

  public sort: SortStateManager = new SortStateManager();
  public search: StateManager<string> = new StateManager('search', '');
  public model: ModelStateManager = new ModelStateManager();
  public facetType: StateManager<FacetType> = new StateManager('facet_type', FacetTypes.Aspect);
  public lastPage: StateManager<SimpleRoute> = new StateManager('last_non_detail_page', stats);

  constructor() {
    this.managers = [ this.sort, this.search, this.model, this.facetType, this.lastPage ];
  }

  clear() {
    this.managers.forEach(manager => manager.clear());
  }

  loadSafe() {
    this.managers.forEach(manager => manager.loadSafe());
  }
}
