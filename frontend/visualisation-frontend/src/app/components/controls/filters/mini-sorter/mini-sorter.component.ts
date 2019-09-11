import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtractionGroup } from 'src/app/models/canonical';
import { SortOption, SortOrder } from '../sort-filter/sort';

@Component({
  selector: 'app-mini-sorter',
  templateUrl: './mini-sorter.component.html',
  styleUrls: ['./mini-sorter.component.scss']
})
export class MiniSorterComponent implements OnInit {
  @Input() data: ExtractionGroup[];
  @Input() sortConfig: SortOption;
  @Input() sortOrder: SortOrder | 'none' = 'none';
  @Input() controlPosition: 'before' | 'after' = 'after';
  @Output() sort: EventEmitter<ExtractionGroup[]>;
  @Output() sortOrderChange: EventEmitter<SortOrder | 'none'>;

  private orderings: any[] = [ 'ascending', 'descending' ];
  private currentOrder = 2;

  constructor() {
    this.sort = new EventEmitter();
    this.sortOrderChange = new EventEmitter();
   }

  ngOnInit() {
    this.currentOrder = this.orderings.findIndex(ordering => ordering === this.sortOrder);
  }

  sortData() {
    this.currentOrder = (this.currentOrder + 1) % this.orderings.length;
    this.sortOrder = this.orderings[this.currentOrder];
    this.sortOrderChange.emit(this.sortOrder);

    if (this.sortOrder === 'none') {
      this.sort.emit(this.data);
    }

    const sorted = this.data.slice().sort(this.sortConfig.sortFunction);

    if (this.sortOrder === 'descending') {
      sorted.reverse();
    }

    this.sort.emit(sorted);
  }

}
