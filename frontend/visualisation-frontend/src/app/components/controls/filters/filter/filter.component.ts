import { Component, OnInit, ViewChild, Output, Input, OnDestroy, EventEmitter } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterOption } from 'src/app/services/filter';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {

  @Input()
  public groups: FilterOption[][] = [];

  @Input()
  public filters: FilterOption[] = [];

  @ViewChild('selector')
  public selector: MatSelect;

  @Output()
  public filterChange: EventEmitter<FilterOption> = new EventEmitter<FilterOption>();

  @Output()
  public clear: EventEmitter<void> = new EventEmitter();

  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
    const filterChange = this.selector.selectionChange.pipe(
      map(event => event.value)
    );
    const filterSub = filterChange.subscribe(this.filterChange);
    const resetSub = this.filterChange.subscribe(change => this.selector.value = null);
    this.subscription = new Subscription();
    this.subscription.add(filterSub);
    this.subscription.add(resetSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
