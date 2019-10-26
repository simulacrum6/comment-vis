import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
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
export class SortFilterComponent implements OnInit, OnChanges {

  public noSortOption: SortOption = SortOptions.options.noSort;

  public sortOptions: SortOptionGroup[] = [
    SortOptionGroups.topics,
    SortOptionGroups.sentiment,
  ];

  public sortOrderOptions: SortOrderOption[] = [
    SortOrderOptions.descending,
    SortOrderOptions.ascending,
  ];

  private _sortState: SortState = { sort: SortOptions.options.noSort, order: SortOrderOptions.descending };

  public get noSort(): boolean {
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
  data: ExtractionGroup[] = [];

  @Input()
  disabled = false;

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

  ngOnChanges(changes: SimpleChanges) {
    this.sortData();
  }

  sortData(): ExtractionGroup[] {
    console.log(`sorting data based on ${this.sortOption.viewValue}`)
    const data = this.data.slice();

    data.sort(this.sortFunction);

    if (!this.noSort && this.sortOrder === 'descending') {
      data.reverse();
    }

    this.sort.emit(data);
    return data;
  }

  onSortStateChange(change: MatSelectChange) {
    this.sort.emit(this.sortData());
  }
}
