import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/internal/operators';
import { ExtractionGroup } from '../../../models/canonical';

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

  @Input() searchTerm = '';

  @Output() searchTermChange: EventEmitter<string> = new EventEmitter();

  /**
   * Emits filtered data that meet the search criteria.
   */
  @Output() searchResults: EventEmitter<ExtractionGroup[]> = new EventEmitter();

  private placeholder = 'Search/Filter';
  private inputForm = new FormControl();
  private subscription: Subscription = new Subscription();

  constructor() { }

  ngOnInit() {
    const searchTermChange = this.inputForm.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name)
    );
    const searchResults = searchTermChange.pipe(
      map(name => this.data.filter(extractionGroup => extractionGroup.name.toLowerCase().startsWith(name.toLowerCase())))
    );

    const searchTermSubscription = searchTermChange.subscribe(this.searchTermChange);
    const searchResultSubscription = searchResults.subscribe(this.searchResults);
    this.subscription.add(searchResultSubscription);
    this.subscription.add(searchTermSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  clearSearch() {
    this.inputForm.setValue('');
  }

  private getAutocompleteUIOutput(selectedOption: ExtractionGroup): string | undefined {
    return selectedOption ? selectedOption.name : undefined;
  }
}
