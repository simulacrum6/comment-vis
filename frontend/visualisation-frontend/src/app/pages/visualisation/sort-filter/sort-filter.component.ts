import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Extraction, ExtractionGroup } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { map } from 'rxjs/operators';

const sortOptions: any = [
  { value: 'none', viewValue: 'None'},
  { value: 'positive', viewValue: 'Positive Sentiments'},
  { value: 'neutral', viewValue: 'Neutral Sentiments'},
  { value: 'negative', viewValue: 'Negative Sentiments'}
];

const sortOrderOptions: any = [
  { value: 'descending', viewValue: 'Descending'},
  { value: 'ascending', viewValue: 'Ascending'}
];

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.scss']
})
export class SortFilterComponent implements OnInit {

  private data$: BehaviorSubject<ExtractionGroup[]>;

  @Input() sortBy = 'none';

  @Input() sortOrder: 'ascending' | 'descending' = 'ascending';

  /**
   * The data to be sorted.
   */
  @Input() set data(value: any[]) {
    this.data$.next(value);
  }
  get data() {
    return this.data$.getValue();
  }

  /**
   * Emits processed data whenever data has either been filtered or sorted.
   */
  @Output() processed: EventEmitter<ExtractionGroup[]>;

  /**
   * Emits processed data, whenever data has been sorted.
   */
  @Output() sort: EventEmitter<ExtractionGroup[]>;


  // TODO: Implement
  /**
   * Emits processed data, whenever data has been filtered.
   */
  @Output() filter: EventEmitter<ExtractionGroup[]>;

  private sortingFunction = (a: ExtractionGroup, b: ExtractionGroup) => {
    const countA = a.sentimentCount[this.sortBy];
    const countB = b.sentimentCount[this.sortBy];
    return countA - countB;
  }

  constructor() {
    this.data$ = new BehaviorSubject<ExtractionGroup[]>([]);
    this.sort = new EventEmitter<ExtractionGroup[]>();
   }

  ngOnInit() {
    this.data$.pipe(
      map(extractionGroups => this.sortData(extractionGroups))
    ).subscribe(this.sort);
  }

  sortData(extractions: ExtractionGroup[]): ExtractionGroup[] {
    const data = extractions.slice();

    if (this.sortBy !== 'none') {
      data.sort(this.sortingFunction);
    }

    if (this.sortOrder !== 'ascending') {
      data.reverse();
    }

    return data;
  }
}
