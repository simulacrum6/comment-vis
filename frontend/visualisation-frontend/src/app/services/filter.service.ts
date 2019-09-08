import { Injectable } from '@angular/core';
import { ExtractionGroup } from '../models/canonical';
import { StateService } from './state.service';

type Filter = (group: ExtractionGroup) => boolean;

type FilterType = 'shun' | 'keep';

class FilterOption {
  public type: FilterType = 'shun';
  constructor(public readonly name: string, public readonly value: any, public readonly filterFunction: Filter) {}
}

enum FilterName {
  StartsWith = 'starts_with',
  IdEquals = 'id_equals'
}

class FilterGenerator {
  private availableFilters: Map<string, (value: any) => FilterOption> = new Map();

  constructor() {
    this.availableFilters.set(FilterName.StartsWith, FilterGenerator.startsWith);
    this.availableFilters.set(FilterName.IdEquals, FilterGenerator.idEquals);
  }

  public static startsWith(start: string): FilterOption {
    const name = FilterName.StartsWith;
    const filter = (group: ExtractionGroup) => group.name.startsWith(start);
    return new FilterOption(name, start, filter);
  }
  public static idEquals(id: string): FilterOption {
    const name = FilterName.IdEquals;
    const filter = (group: ExtractionGroup) => group.id === id;
    return new FilterOption(name, id, filter);
  }

  public generate(filter: string, value: any): FilterOption {
    if (!this.availableFilters.has(filter)) {
      throw new Error(`Filter with name '${filter}' is not available.`);
    }
    const generator = this.availableFilters.get(filter);
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
  private filterGenerator: FilterGenerator = new FilterGenerator();
  private _data: ExtractionGroup[] = [];

  public get filteredData(): ExtractionGroup[] {
    return this.applyFilters();
  }
  public set data(groups: ExtractionGroup[]) {
    this._data = groups;
  }
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
  }
  public remove(filter: string, value: any, type: FilterType = 'shun') {
    const index = this.findIndex(filter, value);
    if (index === -1) {
      console.log(`could not remove filter [${name},${value}], since it is not an active filter`);
    } else {
      this.getFilterOptions(type).splice(index, 1);
    }
  }
  public change(filter: string, oldValue: any, newValue: any, type: FilterType = 'shun') {
    const index = this.findIndex(filter, oldValue, type);
    if (index === -1) {
      console.log(`could not change filter [${filter},${oldValue}], since it is not an active filter`);
    } else {
      this.getFilterOptions(type)[index] = this.filterGenerator.generate(filter, newValue);
    }
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
  private getFilterOptions(type: FilterType): FilterOption[] {
    return type === 'shun' ? this.shunFilters : this.keepFilters;
  }
}
