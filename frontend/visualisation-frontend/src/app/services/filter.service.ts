import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExtractionGroup } from '../models/canonical';
import { StateService } from './state.service';
import { FilterServiceState } from './state-manager/filter-service-state-manager';
import { FilterOption, Filter, FilterType } from './filter';

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

  /**
   * Function to be applied to each ExtractionGroup in data.
   */
  private get filterFunction(): Filter {
    // filterfunction to be applied to groups.
    return (group: ExtractionGroup) => {
      // keep group if some keep filter applies
      const keeps = this.keepFilters.map(opt => opt.filterFunction);
      if (keeps.some(f => f(group))) {
        return true;
      }
      // keep group only if every 'shun' filter applies
      const shuns = this.shunFilters.map(opt => opt.filterFunction);
      return shuns.every(f => f(group));
    };
  }
  private get state(): FilterServiceState {
    return {
      keep: this.keepFilters,
      shun: this.shunFilters,
      filterAfterChange: this.filterAfterChange
    };
  }

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
   * Determines whether the state should be stored.
   */
  public persistState = true;
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
  public get activeFilters() {
    return { keeps: this.keepFilters, shuns: this.shunFilters };
  }

  constructor(private stateService: StateService) {
    if (this.persistState) {
      stateService.filter.loadSafe();
      const state = stateService.filter.state;
      this.keepFilters = state.keep;
      this.shunFilters = state.shun;
      this.filterAfterChange = state.filterAfterChange;
    } else {
      this.clearFilters();
    }
    this.onChange();
  }

  /**
   * Add Filter to active filters, if it does not already exist.
   * @param option the filter to add.
   * @param type the type of filter the option represents.
   */
  public add(option: FilterOption, type: FilterType = 'shun') {
    // do nothing, if filter is already in activeFilter list
    if (this.findIndex(option, type) !== -1) {
      return;
    }
    this.getFilterOptions(type).push(option);
    this.onChange();
  }
  /**
   * Adds option if not in list already or modifies existing option, if it can be identified.
   */
  public set(option: FilterOption, type: FilterType = 'shun') {
    const index = this.findIndex(option, type);
    // add if not in filters
    if (index === -1) {
      this.getFilterOptions(type).push(option);
    // change if already in filters
    } else {
      const oldOpt = this.getFilterOptions(type)[index];
      if (oldOpt.value === option.value && oldOpt.name === option.value) {
        console.log(`options were identical. ignoring call.`)
        return;
      }
      this.getFilterOptions(type)[index] = option;
    }
    this.onChange();
  }
  /**
   * Removes the given filter option from the specified filter list.
   */
  public remove(option: FilterOption, type: FilterType = 'shun') {
    const index = this.findIndex(option, type);
    if (index === -1) {
      console.log(`could not remove FilterOption{${option.id}}, since it is not an active filter`);
    } else {
      this.getFilterOptions(type).splice(index, 1);
    }
    this.onChange();
  }
  /**
   * Updates the given filter option, if it is in the active filters.
   */
  public change(option: FilterOption, type: FilterType = 'shun') {
    const index = this.findIndex(option, type);
    if (index === -1) {
      console.log(`could not change FilterOption{${option.id}}, since it is not an active filter`);
    } else {
      this.getFilterOptions(type)[index] = option;
    }
    this.onChange();
  }
  /**
   * Clears all filters.
   */
  public clearFilters() {
    this.keepFilters = [];
    this.shunFilters = [];
    this.onChange();
  }
  /**
   * Applies all active filter functions to the given groups.
   * Group defaults to `this.data`.
   */
  public applyFilters(group: ExtractionGroup[] = this._data, emit: boolean = false): ExtractionGroup[] {
    const filter = this.filterFunction.bind(this);
    const filtered = group.filter(filter);
    if (emit) {
      this._filteredData.next(filtered);
    }
    return filtered;
  }


  /**
   * Finds the index of the given combination of filter name, value and type in the active filters.
   * Returns -1 if combination is not part of the active filters.
   */
  private findIndex(option: FilterOption, type: FilterType = 'shun'): number {
    const options = this.getFilterOptions(type);
    return options.findIndex((other: FilterOption) => other.id === option.id);
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
    if (this.persistState) {
      this.stateService.filter.state = this.state;
    }
  }
}
