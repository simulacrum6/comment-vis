import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Extraction } from 'src/app/models/canonical';
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

  private data$: BehaviorSubject<Extraction[][]>;

  @Input() sortBy = 'none';

  @Input() sortOrder: 'ascending' | 'descending' = 'ascending';

  // TODO: Implement cleanly
  @Input() dataAccessor: (any) => Extraction[] = (x) => x;

  @Input() set data(value: any[]) {
    this.data$.next(value);
  }
  get data() {
    return this.data$.getValue();
  }

  /**
   * Emits processed data whenever data has either been filtered or sorted.
   */
  @Output() processed: EventEmitter<Extraction[][]>;

  /**
   * Emits processed data, whenever data has been sorted.
   */
  @Output() sort: EventEmitter<Extraction[][]>;


  // TODO: Implement
  /**
   * Emits processed data, whenever data has been filtered.
   */
  @Output() filter: EventEmitter<Extraction[][]>;

  private sortingFunction = (a: Extraction[], b: Extraction[]) => {
    const countA = SentimentCount.fromExtractions(a)[this.sortBy];
    const countB = SentimentCount.fromExtractions(b)[this.sortBy];
    return countA - countB;
  }

  constructor() {
    this.data$ = new BehaviorSubject<Extraction[][]>([]);
    this.sort = new EventEmitter<Extraction[][]>();
   }

  ngOnInit() {
    this.data$.pipe(
      map(data => data.map(this.dataAccessor)),
      map(extractionGroups => this.sortData(extractionGroups))
    ).subscribe(this.sort);
  }

  sortData(extractions: Extraction[][]): Extraction[][] {
    let data = extractions.slice();
    if (this.sortBy !== 'none') {
      data = data.sort(this.sortingFunction);
    }

    if (this.sortOrder !== 'ascending') {
      data.reverse();
    }

    return data;
  }
}
