import { Injectable } from '@angular/core';
import { FacetType, FacetTypes } from '../models/canonical';
import { SimpleRoute } from '../models/utils';
import { FilterServiceStateManager } from './state-manager/filter-service-state-manager';
import { ModelStateManager } from './state-manager/model-state-manager';
import { PaginatorStateManager } from './state-manager/paginator-state-manager';
import { SortStateManager } from './state-manager/sort-state-manager';
import { StateManager } from './state-manager/state-manager';
import { FilterOption, FilterGenerator } from './filter';
import { FilterOptionStateManager } from './state-manager/filter-option-state-manager';

const stats: SimpleRoute = { url: ['/stats/'], queryParams: {} };

// TODO: implement StateManagers for relevant classes.
// TODO: make StateService StateManager<AppState>
@Injectable({
  providedIn: 'root'
})
export class StateService {

  private managers: StateManager<any>[];

  public sort: SortStateManager = new SortStateManager();
  public search: FilterOptionStateManager = new FilterOptionStateManager('search', FilterGenerator.startsWith(''));
  public model: ModelStateManager = new ModelStateManager();
  public facetType: StateManager<FacetType> = new StateManager('facet_type', FacetTypes.Aspect);
  public lastPage: StateManager<SimpleRoute> = new StateManager('last_non_detail_page', stats);
  public visPaginator: PaginatorStateManager = new PaginatorStateManager('visualisation_paginator');
  public filter: FilterServiceStateManager = new FilterServiceStateManager();

  constructor() {
    this.managers = [
      this.sort,
      this.search,
      this.model,
      this.facetType,
      this.lastPage,
      this.visPaginator,
      this.filter
    ];
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
