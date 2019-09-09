import { FilterOption, FilterGenerator } from '../filter';
import { StateManager } from './state-manager';

export class FilterOptionStateManager extends StateManager<FilterOption> {


    public get defaultValue():FilterOption {
        return {
            name: this._defaultValue.name,
            value: this._defaultValue.value,
            filterFunction: this._defaultValue.filterFunction,
            id: this._defaultValue.id
        };
    }

    constructor(name: string, defaultValue: FilterOption) {
        super(name, defaultValue);
        this.deserializer = (stored: string): FilterOption => {
            const option: FilterOption = JSON.parse(stored);
            return FilterGenerator.generate(option.name, option.value, option.id);
        }
    }
}
