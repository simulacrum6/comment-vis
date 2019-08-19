import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Extraction, Extractions } from 'src/app/models/canonical';
import { Interpolator, makeInterpolator } from 'src/app/models/utils';

@Component({
  selector: 'app-pie-cell',
  templateUrl: './pie-cell.component.html',
  styleUrls: ['./pie-cell.component.scss']
})
export class PieCellComponent implements OnInit {
  /** Maximum chart size in pixels. */
  private static readonly MaxSize = 640;

  /** Maximum chart size in pixels. */
  private static readonly MinSize = 64;

  /** Interpolator to set the size of Pie Cells */
  private static interpolator: Interpolator = makeInterpolator(PieCellComponent.MinSize, PieCellComponent.MaxSize);

  @Input() facetType: 'aspect' | 'attribute';
  @Input() name: string;
  @Input() extractions: Extraction[];
  @Input() size = NaN;

  @ViewChild('chartWrapper') chartWrapper: ElementRef;

  constructor() { }

  ngOnInit() {
    this.setSize();
  }

  /** Sets the size of the Pie Cell. */
  private setSize() {
    if (!isNaN(this.size)) {
      this.chartWrapper.nativeElement.style.width = PieCellComponent.interpolator(this.size).toFixed(0) + 'px';
      this.chartWrapper.nativeElement.style.height = this.chartWrapper.nativeElement.style.height;
    }
  }
}
