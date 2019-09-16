import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { MatSelect } from '@angular/material';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-size-scaling',
  templateUrl: './size-scaling.component.html',
  styleUrls: ['./size-scaling.component.scss']
})
export class SizeScalingComponent implements OnInit {

  private scalings = [
    { viewValue: 'Popularity', value: 'poplarity', hint: 'Larger points are talked about more often.' },
    { viewValue: 'Controversy', value: 'controversy', hint: 'Larger points have more varied sentiments.' }
  ];

  @ViewChild('selector')
  public selector: MatSelect;

  @Output()
  public scalingChange: Observable<any>;

  constructor() { }

  ngOnInit() {
    this.scalingChange = this.selector.selectionChange.pipe(
      map(event => event.value)
    );
  }
}
