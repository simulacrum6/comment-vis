import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Interpolator } from 'src/app/models/utils';
import { PieExtractionGroup } from 'src/app/pages/visualisation/compare/compare.component';
import { FilterGenerator, FilterOption } from 'src/app/services/filter';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-pie-cell',
  templateUrl: './pie-cell.component.html',
  styleUrls: ['./pie-cell.component.scss']
})
export class PieCellComponent implements OnInit {
  /** Maximum chart size in pixels. */
  private static readonly MaxSize = 640;

  /** Maximum chart size in pixels. */
  private static readonly MinSize = 48;

  private static readonly ScalingFactor = 12 * PieCellComponent.MinSize;

  /** Interpolator to set the size of Pie Cells */
  private static interpolator: Interpolator = PieCellComponent.scale;

  @Input()
  public group: PieExtractionGroup;

  @ViewChild('chartWrapper')
  public chartWrapper: ElementRef;

  public hover = false;
  public pinned = false;
  private filter: FilterOption;

  /**
   * TODO: Pull Filterservice into Compare Component.
   */
  constructor(private filterService: FilterService) {}

  /**
   * Scaling function for pie size.
   */
  private static scale(value: number): number {
    // TODO: add to utils.makeInterpolator
    return Math.sqrt(value) * PieCellComponent.ScalingFactor + PieCellComponent.MinSize;
  }

  ngOnInit() {
    this.updateSize();
    this.filter = FilterGenerator.idEquals(this.group, this.group.id);
    this.pinned = this.filterService.has(this.filter, 'keep');
  }

  public togglePinned(event: MouseEvent) {
    event.stopPropagation();
    this.pinned = !this.pinned;
    if (this.pinned === true) {
      this.filterService.add(this.filter, 'keep');
    } else {
      this.filterService.remove(this.filter, 'keep');
    }
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
