import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { ExtractionGroup } from 'src/app/models/canonical';
import {
  SortFunctions,
  SortOption,
  SortOptionGroup,
  SortOptionGroups,
  SortOptions, SortOrder,
  SortOrderOption,
  SortOrderOptions,
  SortState
} from './sort';

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.scss']
})
export class SortFilterComponent implements OnInit {

  private _noSortOption: SortOption = SortOptions.options.noSort;

  private _sortOptions: SortOptionGroup[] = [
    SortOptionGroups.sentiment,
    SortOptionGroups.topics
  ];

  private _sortOrderOptions: SortOrderOption[] = [
    SortOrderOptions.descending,
    SortOrderOptions.ascending,
  ];

  private _sortState: SortState;

  private get noSort(): boolean {
    return this.sortFunction === SortFunctions.noSort;
  }

  get sortOption(): SortOption {
    return this.sortState.sort;
  }
  set sortOption(option: SortOption) {
    this.sortState = { order: this.sortState.order, sort: option };
  }

  get sortOrderOption(): SortOrderOption {
    return this.sortState.order;
  }
  set sortOrderOption(option: SortOrderOption) {
    this.sortState = { order: option, sort: this.sortState.sort };
  }

  get sortFunction(): (a: ExtractionGroup, b: ExtractionGroup) => number {
    return this.sortOption.sortFunction;
  }

  get sortOrder(): SortOrder {
    return this.sortOrderOption.order;
  }

  get sortState(): SortState {
    return this._sortState;
  }
  @Input()
  set sortState(state: SortState) {
    this._sortState = state;
    this.sortStateChange.emit(this._sortState);
  }

  @Output()
  sortStateChange: EventEmitter<SortState>;

  /**
   * The data to be sorted.
   */
  @Input()
  data: ExtractionGroup[];

  /**
   * Emits processed data, whenever data has been sorted.
   */
  @Output()
  sort: EventEmitter<ExtractionGroup[]>;

  constructor() {
    this.sort = new EventEmitter();
    this.sortStateChange = new EventEmitter();
   }


  ngOnInit() {
    this.sort.emit(this.sortData());
  }

  sortData(): ExtractionGroup[] {
    const data = this.data.slice();

    data.sort(this.sortFunction);

    if (!this.noSort && this.sortOrder === 'descending') {
      data.reverse();
    }

    return data;
  }

  onSortStateChange(change: MatSelectChange) {
    this.sort.emit(this.sortData());
  }
}
