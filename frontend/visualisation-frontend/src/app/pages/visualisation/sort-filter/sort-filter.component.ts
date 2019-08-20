import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Extraction, ExtractionGroup } from 'src/app/models/canonical';
import { SentimentCount, Sentiment } from 'src/app/models/sentiment';
import { map } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material';

// TODO: Move to separate file.
function sentimentSorter(sentiment: Sentiment) {
  return (a: ExtractionGroup, b: ExtractionGroup) => {
    const countA = a.sentimentCount[sentiment];
    const countB = b.sentimentCount[sentiment];
    return countA - countB;
  };
}

function identity(a: ExtractionGroup, b: ExtractionGroup) { return 0; }

@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.scss']
})
export class SortFilterComponent implements OnInit {

  private sortOptions = [
    { value: 'none', viewValue: '--', sortFunction: identity},
    { value: 'positive', viewValue: 'Most Positive Sentiments', sortFunction: sentimentSorter(Sentiment.Positive)},
    { value: 'neutral', viewValue: 'Most Neutral Sentiments', sortFunction: sentimentSorter(Sentiment.Neutral)},
    { value: 'negative', viewValue: 'Most Negative Sentiments', sortFunction: sentimentSorter(Sentiment.Negative)}
  ];

  private sortOrderOptions = [
    { value: 'descending', viewValue: 'Descending'},
    { value: 'ascending', viewValue: 'Ascending'}
  ];

  private data$: BehaviorSubject<ExtractionGroup[]>;

  @Input() sortOrder: 'ascending' | 'descending' = 'descending';

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
  @Output('processed') processed$: EventEmitter<ExtractionGroup[]>;

  /**
   * Emits processed data, whenever data has been sorted.
   */
  @Output('sort') sort$: EventEmitter<ExtractionGroup[]>;

  // TODO: Implement
  /**
   * Emits processed data, whenever data has been filtered.
   */
  @Output('filter') filter$: EventEmitter<ExtractionGroup[]>;

  private get noSort(): boolean {
    return this.sortFunction === identity;
  }

  private sortFunction: (a: ExtractionGroup, b: ExtractionGroup) => number = identity;

  constructor() {
    this.data$ = new BehaviorSubject<ExtractionGroup[]>([]);
    this.sort$ = new EventEmitter<ExtractionGroup[]>();
   }

  ngOnInit() {
    this.data$.pipe(
      map(extractionGroups => this.sortData(extractionGroups))
    ).subscribe(this.sort$);
  }

  sortData(extractions: ExtractionGroup[]): ExtractionGroup[] {
    const data = extractions.slice();

    data.sort(this.sortFunction);

    if (this.sortFunction !== identity && this.sortOrder === 'descending') {
      data.reverse();
    }

    return data;
  }

  public onSortOptionChange(change: MatSelectChange) {
    this.sortFunction = change.value;
    this.sort$.emit(this.sortData(this.data));
  }

  public onSortOrderChange(change: MatSelectChange) {
    this.sortOrder = change.value;
    this.sort$.emit(this.sortData(this.data));
  }
}
