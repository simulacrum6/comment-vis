import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FilterOption } from 'src/app/services/filter';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.scss']
})
export class ActiveFiltersComponent implements OnInit {
  private _removed: EventEmitter<{ option: FilterOption, type: 'keep' | 'shun' }> = new EventEmitter();
  private removable = true;

  @Input()
  public activeFilters: { keeps: FilterOption[], shuns: FilterOption[] } = { keeps: [], shuns: [] };
  @Output()
  public removed: Observable<{ option: FilterOption, type: 'keep' | 'shun' }> = this._removed.asObservable();

  constructor() { }

  ngOnInit() { }

  private remove(option: FilterOption, type: 'keep' | 'shun') {
    this._removed.emit({ option, type });
  }
}
