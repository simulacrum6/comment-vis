import {Component, Input, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {ExtractionGroup, FacetType} from '../../../models/canonical';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/internal/operators';

@Component({
  selector: 'app-search-filter',
  templateUrl: './search-filter.component.html',
  styleUrls: ['./search-filter.component.scss']
})
export class SearchFilterComponent implements OnInit {

  /**
   * The data to be sorted.
   */
  @Input() data: ExtractionGroup[];

  @Input() facetType: FacetType;

  /**
   * Emits searched data whenever the search value has changed
   */
  @Output() searchedValue: Observable<ExtractionGroup[]> = new Observable<ExtractionGroup[]>();

  private placeholder = 'Search';
  private formControl = new FormControl();
  private filterOptions: Observable<ExtractionGroup[]>;

  constructor() {
  }

  ngOnInit() {
    this.filterOptions = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.data.filter(extractionGroup => extractionGroup.name.toLowerCase().startsWith(value.toLowerCase())))
    );
  }

  getAutocompleteUIOutput(selectedOption: ExtractionGroup): string | undefined {
    return selectedOption ? selectedOption.name : undefined;
  }

}
