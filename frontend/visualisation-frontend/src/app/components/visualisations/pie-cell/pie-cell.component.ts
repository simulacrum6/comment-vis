import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Extraction } from 'src/app/models/canonical';
import { Interpolator, makeInterpolator } from 'src/app/models/utils';
import { PieExtractionGroup } from 'src/app/pages/visualisation/compare/compare.component';

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

  @Input()
  public group: PieExtractionGroup;

  @ViewChild('chartWrapper')
  public chartWrapper: ElementRef;

  private hover = false;
  private pinned = false;

  constructor() { }

  ngOnInit() {
    this.updateSize();
  }

  private togglePinned(event: MouseEvent) {
    event.stopPropagation();
    this.pinned = !this.pinned;
  }

  /**
   * Sets the size of the Pie Cell. Used to scale pies.
   */
  private updateSize() {
    const size = this.group.sizeRatio;
    if (!isNaN(size)) {
      this.chartWrapper.nativeElement.style.width = PieCellComponent.interpolator(size).toFixed(0) + 'px';
      this.chartWrapper.nativeElement.style.height = this.chartWrapper.nativeElement.style.height;
    }
  }
}
