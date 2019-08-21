import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { ExtractionGroup } from 'src/app/models/canonical';
import { MatSelectChange } from '@angular/material';
import { merge } from 'rxjs';
import { SortOption, SortOptions, SortOptionGroup, SortOptionGroups, SortFunctions, SortOrder, SortOrderOption } from './sort';

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.scss']
})
export class SortFilterComponent implements OnInit {

  private noSortOption: SortOption = SortOptions.options.noSort;

  private sortOptions: SortOptionGroup[] = [
    SortOptionGroups.sentiment,
    SortOptionGroups.topics
  ];

  private sortOrderOptions: SortOrderOption[] = [
    { order: 'descending', viewValue: 'Descending' },
    { order: 'ascending', viewValue: 'Ascending' }
  ];

  private sortFunction: (a: ExtractionGroup, b: ExtractionGroup) => number = SortFunctions.noSort;

  private get noSort(): boolean {
    return this.sortFunction === SortFunctions.noSort;
  }

  @Input() sortOrder: SortOrder = 'descending';

  /**
   * The data to be sorted.
   */
  @Input() data: ExtractionGroup[];

  /**
   * Emits processed data, whenever data has been sorted.
   */
  @Output('sort') sort$: EventEmitter<ExtractionGroup[]>;

  // TODO: Implement
  /**
   * Emits processed data, whenever data has been filtered.
   */
  @Output('filter') filter$: EventEmitter<ExtractionGroup[]>;

  /**
   * Emits processed data whenever data has either been filtered or sorted.
   */
  @Output('processed') processed$: Observable<ExtractionGroup[]>;


  constructor() {
    this.sort$ = new EventEmitter<ExtractionGroup[]>();
    this.filter$ = new EventEmitter<ExtractionGroup[]>();
    this.processed$ = merge(this.sort$, this.filter$) as Observable<ExtractionGroup[]>;
   }

  ngOnInit() {
    this.sort$.emit(this.sortData());
  }

  sortData(): ExtractionGroup[] {
    const data = this.data.slice();

    data.sort(this.sortFunction);

    if (!this.noSort && this.sortOrder === 'descending') {
      data.reverse();
    }

    return data;
  }

  public onSortOptionChange(change: MatSelectChange) {
    this.sort$.emit(this.sortData());
  }

  public onSortOrderChange(change: MatSelectChange) {
    this.sort$.emit(this.sortData());
  }
}
