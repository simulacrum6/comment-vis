import { Injectable } from '@angular/core';
import { StateManager } from './state-manager';
import { ModelStateManager } from "./model-state-manager";
import { SortStateManager } from "./sort-state-manager";


// TODO: implement StateManagers for relevant classes.
// TODO: make StateService StateManager<AppState>
@Injectable({
  providedIn: 'root'
})
export class StateService {
  public sort: SortStateManager = new SortStateManager();
  public search: StateManager<string> = new StateManager<string>('search', '');
  public model: ModelStateManager = new ModelStateManager();

  constructor() {

  }
}
