import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  private layouts = [
    { viewValue: 'Random', value: 'random', hint: 'Points are placed randomly on the map.' },
    { viewValue: 'Semantic', value: 'meaning', hint: 'Points that are closer to each other have a similar meaning.' }
  ];

  @ViewChild('selector')
  public selector: MatSelect;

  @Output()
  public layoutChange: Observable<any>;

  constructor() { }

  ngOnInit() {
    this.layoutChange = this.selector.selectionChange.pipe(
      map(event => event.value)
    );
  }
}
