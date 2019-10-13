import { Component, OnInit, ViewChild, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtractionGroup, sentimentDifferential } from 'src/app/models/canonical';
import { controversy } from 'src/app/models/sentiment';

// sizing functions.
export function occurencePercentage(scaleDownFactor: number) {
  return (group: ExtractionGroup) => group.extractions.length / scaleDownFactor;
}
export function controversial(scaleDownFactor: number) {
    return (g: ExtractionGroup) => controversy(g.sentimentCount) / scaleDownFactor;
}

@Component({
  selector: 'app-size-scaling',
  templateUrl: './size-scaling.component.html',
  styleUrls: ['./size-scaling.component.scss']
})
export class SizeScalingComponent implements OnInit, OnDestroy {

  @Input()
  public scaleDownFactor = 1000;

  @Output()
  public scalingChange: EventEmitter<(g: ExtractionGroup) => number> = new EventEmitter();

  @ViewChild('selector')
  public selector: MatSelect;

  public scalings = [];
  private subscription: Subscription = new Subscription();

  constructor() { }

  ngOnInit() {
    this.scalings = [
      { viewValue: 'Popularity', value: occurencePercentage(this.scaleDownFactor), hint: 'Larger points are talked about more often.' },
      { viewValue: 'Controversy', value: controversial(1000), hint: 'Larger points have more varied sentiments.' }
    ];
    this.subscription = this.selector.selectionChange.pipe(
      map(event => event.value)
    ).subscribe(this.scalingChange);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
