import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  private filters = [
  ];

  @ViewChild('selector')
  public selector: MatSelect;

  @Output()
  public filterChange: Observable<any>;

  constructor() { }

  ngOnInit() {
    this.filterChange = this.selector.selectionChange.pipe(
      map(event => event.value)
    );
  }}
