import { Injectable } from '@angular/core';
import { FacetType, FacetTypes } from '../models/canonical';
import { SimpleRoute } from '../models/utils';
import { ModelStateManager } from './model-state-manager';
import { SortStateManager } from './sort-state-manager';
import { StateManager } from './state-manager';
import { PaginatorStateManager } from './paginator-state-manager';

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
  public visPaginator: PaginatorStateManager = new PaginatorStateManager('visualisation_paginator');

  constructor() {
    this.managers = [ this.sort, this.search, this.model, this.facetType, this.lastPage, this.visPaginator ];
  }

  clear() {
    this.managers.forEach(manager => manager.clear());
  }

  loadSafe() {
    this.managers.forEach(manager => {
      if (!manager.hasState) {
        manager.loadSafe();
      }
    });
  }
}
