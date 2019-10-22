import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, map, mapTo } from 'rxjs/internal/operators';
import { ExtractionGroup } from 'src/app/models/canonical';
import { FilterGenerator, FilterOption } from 'src/app/services/filter';
import { FilterService } from 'src/app/services/filter.service';
import { StateService } from 'src/app/services/state.service';
import { MatAutocompleteSelectedEvent } from '@angular/material';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit, OnDestroy {

  @Output()
  public searchTermChange: EventEmitter<string> = new EventEmitter();
  /**
   * The filterService connected to the component.
   */
  @Input()
  public filterService: FilterService;
  @Input()
  public set searchTerm(term: string) {
    this.searchFilter.value = term;
    this.searchTermChange.emit(term);
  }
  /**
   * The current search term, displayed by the component.
   */
  public get searchTerm(): string {
    return this.searchFilter.value;
  }
  @Input()
  public disabled = false;

  private inputForm = new FormControl('');
  private subscription: Subscription = new Subscription();
  private searchFilter = FilterGenerator.startsWith('');

  constructor(private stateService: StateService) {}

  ngOnInit() {
    if (this.stateService.search.hasState) {
      this.searchFilter = this.stateService.search.state;
    }
    if (this.searchTerm) {
      this.filterService.set(this.searchFilter);
    }
    this.inputForm.setValue(this.searchTerm);
    const searchTermChange = this.inputForm.valueChanges.pipe(
      debounceTime(200),
      map(this.getAutocompleteUIOutput)
    );
    const searchTermSubscription = searchTermChange.subscribe(term => this.onSearchTermChange(term));
    this.subscription = searchTermSubscription;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public clearSearch() {
    this.inputForm.reset();
  }

  public pinOption(event: MatAutocompleteSelectedEvent) {
    const group: ExtractionGroup = event.option.value;
    const filter = FilterGenerator.idEquals(group, group.id);
    this.filterService.add(filter, 'keep');
  }

  private onSearchTermChange(term: string) {
    this.searchTermChange.emit(term);
    const id = this.searchFilter.id;
    this.searchFilter = FilterGenerator.startsWith(term, id);
    this.stateService.search.state = this.searchFilter;
    // remove filter, if term is empty
    if (term !== '') {
      this.filterService.set(this.searchFilter);
    } else {
      this.filterService.remove(this.searchFilter);
    }
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
