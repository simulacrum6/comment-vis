import { StateManager } from './state-manager';
import { FilterGenerator, FilterOption } from '../filter';

export class VisualisationState {

  constructor(title: string, breadcrumb: string) {}

}

export class VisualisationStateManager extends StateManager<VisualisationState> {

    get defaultValue(): VisualisationState {
      return {...this._defaultValue};
    }

  constructor() {
    super('vis', {title: '', breadcrumb: ''});
  }
}
