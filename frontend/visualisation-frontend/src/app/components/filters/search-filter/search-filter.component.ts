import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/internal/operators';
import { ExtractionGroup } from '../../../models/canonical';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {

  /**
   * The input data which will be filtered
   */
  @Input() data: ExtractionGroup[];

  /**
   * Emits filtered data whenever the search value has changed
   */
  @Output() filteredDataEmitter: EventEmitter<ExtractionGroup[]> = new EventEmitter<ExtractionGroup[]>();

  private placeholder = 'Search/Filter';
  private inputForm = new FormControl();
  private autocompleteFilteredOptions: Observable<ExtractionGroup[]>;

  constructor() {
  }

  ngOnInit() {
    this.autocompleteFilteredOptions = this.inputForm.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value.name),
      map(name => this.data.filter(extractionGroup => extractionGroup.name.toLowerCase().startsWith(name.toLowerCase()))),
    );

    this.autocompleteFilteredOptions.subscribe({
      next: filteredData => this.emitFilteredData(filteredData)
    });
  }

  private getAutocompleteUIOutput(selectedOption: ExtractionGroup): string | undefined {
    return selectedOption ? selectedOption.name : undefined;
  }

  private emitFilteredData(data: ExtractionGroup[]) {
    this.filteredDataEmitter.emit(data);
  }

  public clearSearch() {
    this.inputForm.setValue('');
  }

}
