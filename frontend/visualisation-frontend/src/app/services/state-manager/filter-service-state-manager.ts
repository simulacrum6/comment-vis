import { StateManager } from './state-manager';
import { FilterGenerator, FilterOption } from '../filter';

export interface FilterServiceState {
    keep: FilterOption[];
    shun: FilterOption[];
    filterAfterChange: boolean;
  }

export class FilterServiceStateManager extends StateManager<FilterServiceState> {
    constructor() {
        super('filter_service', { keep: [], shun: [], filterAfterChange: true });
        this.deserializer = (stored: string) => {
            const state = JSON.parse(stored) as FilterServiceState;
            const restore = (opt) => FilterGenerator.generate(opt.name, opt.value, opt.id);
            state.keep = state.keep.map(restore);
            state.shun = state.shun.map(restore);
            return state;
        }
    }
}
