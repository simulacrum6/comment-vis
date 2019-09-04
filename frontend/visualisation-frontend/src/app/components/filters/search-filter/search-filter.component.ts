import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, map, mapTo } from 'rxjs/internal/operators';
import { ExtractionGroup } from 'src/app/models/canonical';


function mapToName(value: ExtractionGroup | string, index: number, fallback = ''): string {
  if (value === null) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.name;
}

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit, OnDestroy {
  /**
   * The input data which will be filtered
   */
  @Input() data: ExtractionGroup[];

  get searchTerm(): string {
    return this._term;
  }
  @Input() set searchTerm(term: string) {
    this._term = term;
  }

  @Output() searchTermChange: EventEmitter<string> = new EventEmitter();

  /**
   * Emits filtered data that meet the search criteria.
   */
  @Output() searchResults: EventEmitter<ExtractionGroup[]> = new EventEmitter();

  private _term;
  private inputForm = new FormControl('');
  private subscription: Subscription = new Subscription();

  constructor() {
    const searchTermChange = this.inputForm.valueChanges.pipe(
      debounceTime(200),
      map(mapToName)
    );
    const searchResults = searchTermChange.pipe(
      map(name => this.data.filter(extractionGroup => extractionGroup.name.toLowerCase().startsWith(name.toLowerCase())))
    );

    const searchTermSubscription = searchTermChange.subscribe(this.searchTermChange);
    const searchResultSubscription = searchResults.subscribe(this.searchResults);
    this.subscription.add(searchResultSubscription);
    this.subscription.add(searchTermSubscription);
  }

  ngOnInit() {
    this.inputForm.setValue(this.searchTerm);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  clearSearch() {
    this.inputForm.reset();
  }

  private getAutocompleteUIOutput(selectedOption: ExtractionGroup | string): string {
    if (selectedOption === null) {
      return '';
    }
    if (typeof selectedOption === 'string') {
      return selectedOption;
    } else {
      return selectedOption.name;
    }
  }
}
