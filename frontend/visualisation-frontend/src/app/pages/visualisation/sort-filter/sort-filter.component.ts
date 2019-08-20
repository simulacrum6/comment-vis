import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Extraction, ExtractionGroup, Extractions } from 'src/app/models/canonical';
import { SentimentCount, Sentiment } from 'src/app/models/sentiment';
import { MatSelectChange } from '@angular/material';

// TODO: Move to separate file.
export interface SortOption {
  viewValue: string;
  sortFunction: (a: any, b: any) => number;
  value?: any;
}

export interface SortOptionGroup {
  name: string;
  members: SortOption[];
}

function sentimentSorter(sentiment: Sentiment) {
  return (a: ExtractionGroup, b: ExtractionGroup) => {
    const countA = a.sentimentCount[sentiment];
    const countB = b.sentimentCount[sentiment];
    return countA - countB;
  };
}

function controversy(counts: SentimentCount) {
  const difference = counts.positive - counts.negative;
  const sum = counts.positive + counts.negative;
  return 1 / ((Math.abs(difference) + 1) / (sum));
}

function sortByControversy(a: ExtractionGroup, b: ExtractionGroup) {
  return controversy(a.sentimentCount) - controversy(b.sentimentCount);
}

function identity(a: ExtractionGroup, b: ExtractionGroup) { return 0; }

const noSortOption: SortOption = { value: 'none', viewValue: '--', sortFunction: identity};

const sentimentOptions: SortOption[] = [
  { value: 'controvery', viewValue: 'controversial', sortFunction: sortByControversy },
  { value: 'positive', viewValue: 'positive', sortFunction: sentimentSorter(Sentiment.Positive) },
  { value: 'neutral', viewValue: 'neutral', sortFunction: sentimentSorter(Sentiment.Neutral) },
  { value: 'negative', viewValue: 'negative', sortFunction: sentimentSorter(Sentiment.Negative) }
];

function sortByExtractionLength(a: ExtractionGroup, b: ExtractionGroup) {
  return a.extractions.length - b.extractions.length;
}

function sortByAspects(a: ExtractionGroup, b: ExtractionGroup) {
  const property = 'aspect';
  return Extractions.groupByFlat(a.extractions, property).length - Extractions.groupByFlat(b.extractions, property).length;
}

function sortByAttributes(a: ExtractionGroup, b: ExtractionGroup) {
  const property = 'attribute';
  return Extractions.groupByFlat(a.extractions, property).length - Extractions.groupByFlat(b.extractions, property).length;
}

function sortByComments(a: ExtractionGroup, b: ExtractionGroup) {
  const property = 'comment';
  return Extractions.groupByFlat(a.extractions, property).length - Extractions.groupByFlat(b.extractions, property).length;
}

const extractionOptions = [
  { viewValue: 'talked about', sortFunction: sortByExtractionLength },
  { viewValue: 'comments', sortFunction: sortByComments },
  { viewValue: 'subtopics', sortFunction: sortByAspects },
  { viewValue: 'aspects', sortFunction: sortByAttributes },
  // TODO: Implement { viewValue: 'most subtopics', sortFunction: identity },
];


@Component({
  selector: 'app-sort-filter',
  templateUrl: './sort-filter.component.html',
  styleUrls: ['./sort-filter.component.scss']
})
export class SortFilterComponent implements OnInit {

  private noSortOption: SortOption = noSortOption;

  private sortOptions: SortOptionGroup[] = [
    { name: 'Sentiment', members: sentimentOptions },
    { name: 'Topic', members: extractionOptions },
  ];

  private sortOrderOptions = [
    { value: 'descending', viewValue: 'Descending' },
    { value: 'ascending', viewValue: 'Ascending' }
  ];

  private data$: BehaviorSubject<ExtractionGroup[]>;

  private sortFunction: (a: ExtractionGroup, b: ExtractionGroup) => number = identity;

  private get noSort(): boolean {
    return this.sortFunction === identity;
  }

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



  constructor() {
    this.data$ = new BehaviorSubject<ExtractionGroup[]>([]);
    this.sort$ = new EventEmitter<ExtractionGroup[]>();
   }

  ngOnInit() {
    this.sort$.emit(this.sortData(this.data));
  }

  sortData(extractions: ExtractionGroup[]): ExtractionGroup[] {
    const data = extractions.slice();

    data.sort(this.sortFunction);

    if (!this.noSort && this.sortOrder === 'descending') {
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
