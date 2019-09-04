import { Injectable } from '@angular/core';
import { ModelStateManager, SortStateManager, StateManager } from './state-manager';


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
