import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExtractionGroup } from '../models/canonical';
import { StateService } from './state.service';

type Filter = (group: ExtractionGroup) => boolean;

type FilterType = 'shun' | 'keep';

class FilterOption {
  constructor(public readonly name: string, public readonly value: any, public readonly filterFunction: Filter) {}
}

export enum DefaultFilterName {
  StartsWith = 'starts_with',
  IdEquals = 'id_equals'
}

class FilterGenerator {
  /**
   * Maps available filter names to their generator functions.
   */
  public registry: Map<string, (value: any) => FilterOption> = new Map();
  /**
   * Returns the names of the available filters.
   * Only filters in this list can be used with the `generate` function.
   */
  public get availableFilters(): string[] {
    return Array.from(this.registry.keys());
  }

  constructor() {
    this.registry.set(DefaultFilterName.StartsWith, FilterGenerator.startsWith);
    this.registry.set(DefaultFilterName.IdEquals, FilterGenerator.idEquals);
  }

  public static startsWith(start: string): FilterOption {
    const name = DefaultFilterName.StartsWith;
    const filter = (group: ExtractionGroup) => group.name.startsWith(start);
    return new FilterOption(name, start, filter);
  }
  public static idEquals(id: string): FilterOption {
    const name = DefaultFilterName.IdEquals;
    const filter = (group: ExtractionGroup) => group.id === id;
    return new FilterOption(name, id, filter);
  }

  public generate(filter: string, value: any): FilterOption {
    if (!this.registry.has(filter)) {
      throw new Error(`Filter with name '${filter}' is not available.`);
    }
    const generator = this.registry.get(filter);
    return generator(value);
  }
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  /**
   * Keep Filters are applied before Shun Filters.
   * If any of their filter function matches the tested ExtractionGroup,
   * it is kept in the filtered results, regardless of Shun Filters.
   */
  private keepFilters: FilterOption[] = [];
  /**
   * Shun Filters are applied after Keep Filters.
   * They work as you would expect Filters to work.
   */
  private shunFilters: FilterOption[] = [];
  private _data: ExtractionGroup[] = [];
  private _filteredData: BehaviorSubject<ExtractionGroup[]> = new BehaviorSubject([]);

  public filterGenerator: FilterGenerator = new FilterGenerator();
  /**
   * Observable of the filtered data.
   */
  public readonly filteredDataChange = this._filteredData.asObservable();
  /**
   * Determines if filters are applied immediately after active filters or data were changed. \
   * If set to `false`, Observers of `filteredDataChange` will only receive updates of the data,
   * once `filteredData` is accessed.
   */
  public filterAfterChange = true;
  /**
   * The data to be filtered.
   */
  public set data(groups: ExtractionGroup[]) {
    this._data = groups;
    if (this.filterAfterChange) {
      this._filteredData.next(this.applyFilters());
    }
  }
  /**
   * The filtered data.
   */
  public get filteredData(): ExtractionGroup[] {
    // update if filtered data was not updated yet
    if (!this.filterAfterChange) {
      this._filteredData.next(this.applyFilters());
    }
    return this._filteredData.getValue();
  }
  /**
   * Function to be applied to each ExtractionGroup in data.
   */
  private get filterFunction(): Filter {
    return (group: ExtractionGroup) => {
      const keeps = this.keepFilters.map(opt => opt.filterFunction);
      if (keeps.some(f => f(group))) {
        return true;
      }
      const shuns = this.shunFilters.map(opt => opt.filterFunction);
      return shuns.every(f => f(group));
    };
  }

  constructor(private stateService: StateService) { }

  public add(filter: string, value: any, type: FilterType = 'shun') {
    // do nothing, if filter is already in activeFilter list
    if (this.findIndex(filter, value, type) !== -1) {
      return;
    }
    const option = this.filterGenerator.generate(filter, value);
    this.getFilterOptions(type).push(option);
    this.onChange();
  }
  public remove(filter: string, value: any, type: FilterType = 'shun') {
    const index = this.findIndex(filter, value);
    if (index === -1) {
      console.log(`could not remove filter [${name},${value}], since it is not an active filter`);
    } else {
      this.getFilterOptions(type).splice(index, 1);
    }
    this.onChange();
  }
  public change(filter: string, oldValue: any, newValue: any, type: FilterType = 'shun') {
    const index = this.findIndex(filter, oldValue, type);
    if (index === -1) {
      console.log(`could not change filter [${filter},${oldValue}], since it is not an active filter`);
    } else {
      this.getFilterOptions(type)[index] = this.filterGenerator.generate(filter, newValue);
    }
    this.onChange();
  }

  /**
   * Finds the index of the given combination of filter name, value and type in the active filters.
   * Returns -1 if combination is not part of the active filters.
   */
  private findIndex(filter: string, value: any, type: FilterType = 'shun'): number {
    const finder = (option: FilterOption) => (option.name === filter) && (option.value === value);
    const options = this.getFilterOptions(type);
    return options.findIndex(finder);
  }
  /**
   * Applies all active filter functions to the given group.
   */
  private applyFilters(): ExtractionGroup[] {
    const filter = this.filterFunction.bind(this);
    return this._data.filter(filter);
  }
  /**
   * Returns either all 'shun' filters or all 'keep' filters.
   */
  private getFilterOptions(type: FilterType): FilterOption[] {
    return type === 'shun' ? this.shunFilters : this.keepFilters;
  }
  private onChange() {
    if (this.filterAfterChange) {
      this._filteredData.next(this.applyFilters());
    }
  }
}
