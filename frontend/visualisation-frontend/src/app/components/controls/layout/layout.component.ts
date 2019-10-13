import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  private layouts = {
    random: { viewValue: 'Random', value: 'random', hint: 'Points are placed randomly on the map.' },
    semantic: [
      { viewValue: 't-SNE', value: 'meaning', hint: 'Points that are closer to each other have a similar meaning.' },
      { viewValue: 'Hierarchical', value: 'clustered', hint: 'Points that are closer to each other have a similar meaning.' }
    ]
  };

  @ViewChild('selector')
  public selector: MatSelect;

  @Output()
  public layoutChange: EventEmitter<any> = new EventEmitter();

  private subscription: Subscription;

  constructor() { }

  ngOnInit() {
    this.subscription = this.selector.selectionChange.pipe(
      map(event => event.value)
    ).subscribe(this.layoutChange);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
