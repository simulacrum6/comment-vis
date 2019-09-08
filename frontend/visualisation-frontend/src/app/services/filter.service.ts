import { Injectable } from '@angular/core';
import { ExtractionGroup } from '../models/canonical';
import { StateService } from './state.service';

type Filter = (group: ExtractionGroup) => boolean;

class FilterOption {
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
  private filterGenerator: FilterGenerator = new FilterGenerator();
  private activeFilters: FilterOption[] = [];
  private _data: ExtractionGroup[] = [];
  private matchType: 'all' | 'any' = 'all';

  public get filteredData(): ExtractionGroup[] {
    return this.applyFilters();
  }
  public set data(groups: ExtractionGroup[]) {
    this._data = groups;
  }
  private get filterFunctions(): Filter[] {
    return this.activeFilters.map(option => option.filterFunction);
  }

  constructor(private stateService: StateService) { }

  public add(filter: string, value: any) {
    // do nothing, if filter is already in activeFilter list
    if (this.findIndex(filter, value) !== -1) {
      return;
    }
    const option = this.filterGenerator.generate(filter, value);
    this.activeFilters.push(option);
  }
  public remove(filter: string, value: any) {
    const index = this.findIndex(filter, value);
    if (index === -1) {
      console.log(`could not remove filter [${name},${value}], since it is not an active filter`);
    } else {
      this.activeFilters.splice(index, 1);
    }
  }
  public change(filter: string, oldValue: any, newValue: any) {
    const index = this.findIndex(filter, oldValue);
    if (index === -1) {
      console.log(`could not change filter [${filter},${oldValue}], since it is not an active filter`);
    } else {
      this.activeFilters[index] = this.filterGenerator.generate(filter, newValue);
    }
  }
  /**
   * Finds the index of the given combination of filter name and value in activeFilters.
   * Returns -1 if combination is not part of activeFilters.
   */
  private findIndex(filter: string, value: any): number {
    return this.activeFilters.findIndex(option => {
      console.log(option.name)
      console.log(option.value)
      return (option.name === filter) && (option.value === value)
    });
  }
  /**
   * Applies all active filter functions to the given group.
   */
  private applyFilters(): ExtractionGroup[] {
    const filterFunction: Filter = this.matchType === 'all' ? this.matchAll.bind(this) : this.matchAny.bind(this);
    return this._data.filter(filterFunction);
  }
  /**
   * Applies all active filter functions to the given group.
   * Returns true, if *all* filters apply;
   */
  private matchAll(group: ExtractionGroup): boolean {
    return this.filterFunctions.every(f => f(group));
  }
  /**
   * Applies all active filter functions to the given group.
   * Returns true, if *some* filter applies;
   */
  private matchAny(group: ExtractionGroup): boolean {
    return this.filterFunctions.some(f => f(group));
  }
}
