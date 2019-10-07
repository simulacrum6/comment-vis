import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartDataSets, ChartPoint } from 'chart.js';
import 'chartjs-plugin-dragdata';
import { default as Color } from 'color';
import { BaseChartDirective } from 'ng2-charts';
import { combineLatest, Subscription } from 'rxjs';
import { StateService } from 'src/app/services/state.service';
import { Extraction, ExtractionGroup, FacetType, Model, sentimentDifferential } from '../../../models/canonical';
import { controversy, getMixedWeightedSentimentColor } from '../../../models/sentiment';
import { Chart } from 'chart.js';
import { Coordinate, LayoutService, LayoutName } from 'src/app/services/layout.service';

@Component({
  selector: 'app-bubble',
  templateUrl: './bubble.component.html',
  styleUrls: ['./bubble.component.scss']
})
export class BubbleComponent implements OnInit, OnDestroy {
  public static readonly ScaleMin = 0;
  public static readonly ScaleMax = 100;

  @ViewChild('chart')
  private chartDirective: BaseChartDirective;
  private sub: Subscription = new Subscription();
  private model: Model = null;
  private bubbles: Bubble[] = [];
  private chartData: ChartDataSets[] = [];
  private dragState: DragState = new DragState();
  private chartPoints: ChartPoint[] = []
  private chartOptions = {
    legend: { display: false },
    responsive: true,
    dragData: true,
    dragX: true,
    onDragStart: this.onDragStart,
    onDrag: this.onDrag,
    onDragEnd: this.onDragEnd.bind(this),
    tooltips: {
      mode: 'point',
      intersect: true,
      callbacks: {
        label: (tooltipItem, data) => {
          const label = data.datasets[tooltipItem.datasetIndex].label || '';
          const chartPoint = data.datasets[tooltipItem.datasetIndex].data[0] as ChartPoint;
          const size = Math.round(chartPoint.r);
          return `${label}: ${size}`;
        }
      }
    },
    scales: {
      xAxes: [{
        ticks: { beginAtZero: true, min: BubbleComponent.ScaleMin, max: BubbleComponent.ScaleMax, display: false },
        gridLines: { display: false }
      }],
      yAxes: [{
        ticks: { beginAtZero: true, min: BubbleComponent.ScaleMin, max: BubbleComponent.ScaleMax, display: false },
        gridLines: { display: false }
      }]
    },
    layout: {
      // Padding so values on the edge are not easily cut off
      // TODO: change to max radius of chart points?
      padding: { left: 20, right: 20, top: 20, bottom: 20 }
    }
  };

  private get chart(): Chart {
    return this.chartDirective.chart;
  }
  private get canvas(): HTMLElement {
    return (this.chartDirective as any).element.nativeElement as HTMLElement;
  }

  /**
   * Whether bubbles should be merged after dragging onto each other.
   */
  @Input()
  public mergeOnDrop = true;
  @Input()
  public groups: ExtractionGroup[] = [];
  @Input()
  public layout = LayoutService.randomLayout(10000);
  public layoutName: LayoutName = 'meaning';
  public type: FacetType = 'aspect';

  constructor(
    private stateService: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private layoutService: LayoutService
    ) { }

  ngOnInit() {
    this.update();
    // deactivate animations after first load.
    const opts: any = this.chartOptions;
    opts.animation = { duration: 0 };
    this.sub = this.layoutService.layoutChanges
    .subscribe(
      layout => {
        if (layout.length >= this.groups.length) {
          this.layout = layout;
          this.update();
        }
      },
      error => {
        console.warn('could not get a proper layout, getting a random one instead')
        this.layout = this.layoutService.getRandomLayout(this.groups.map(g => g.name));
        this.update();
      }
    );
    const names = this.groups.map(g => g.name);
    this.layoutService.getLayout(names, this.layoutName);
  }
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  public update() {
    this.stateService.loadSafe();
    this.model = this.stateService.model.state;
    this.type = this.stateService.facetType.state;
    this.groups = this.model.getGroupsFor(this.type);
    const occurences = this.model.extractions.length;

    // sizing functions.
    const occurencePercentage = (group: ExtractionGroup) => group.extractions.length / occurences;
    const positive = (g: ExtractionGroup) => sentimentDifferential(g.extractions) / 750;
    const clear = (g: ExtractionGroup) => Math.abs(positive(g)) * 3;
    const clearMinimumCount = (g: ExtractionGroup) => g.extractions.length > 3 ? clear(g) : 0;
    const controversial = (g: ExtractionGroup) => controversy(g.sentimentCount) / 1000;

    // generate data
    this.bubbles = Bubble.fromLayout(this.groups, this.layout, occurencePercentage);
    this.fillChartData(this.bubbles);
  }
  public handleBubbleClick({ event, active }: { event: MouseEvent, active: any[] }) {
    if (active.length > 0) {
      const chart: Chart = active[0]._chart;
      const activePoints: any[] = chart.getElementAtEvent(event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._datasetIndex;
        const label = chart.data.datasets[clickedElementIndex].label;
        this.navigateToDetailPage(label, this.type);
      }
    }
  }

  private navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }
  private fillChartData(bubbles: Bubble[]) {
    this.chartData = bubbles.map(bubble => {
      const dataset: any = {};
      dataset.data = [{
        x: bubble.xPosition,
        y: bubble.yPosition,
        r: bubble.size}];
      dataset.label = bubble.label;
      const color: Color = getMixedWeightedSentimentColor(bubble.sentimentRatio);
      dataset.backgroundColor = color.alpha(0.6).toString();
      dataset.hoverBackgroundColor = color.alpha(0.8).toString();
      dataset.borderColor = color.toString();
      dataset.hoverBorderColor = color.alpha(0.8).toString();
      return dataset;
    });
    this.chartPoints = this.chartData
      .map(ds => ds.data[0] as ChartPoint)
      .map((dp: ChartPoint) => ({...dp}));
  }
  private get onDragStart() {
    return (event: MouseEvent, element: PseudoElement) => {
      this.dragState.element = element;
    };
  }
  private get onDrag() {
    return (event: MouseEvent, datasetIndex: number, index: number, value: any) => {
      const widthRatio = this.dragState.element._chart.canvas.width / BubbleComponent.ScaleMax;
      const heigthRatio = this.dragState.element._chart.canvas.height / BubbleComponent.ScaleMax;
      const closest: number = this.dragState.findIntersectingPoints(widthRatio, heigthRatio);

      // enlarge closest point, keep others the same
      if (this.mergeOnDrop) {
        this.chart.data.datasets.forEach((ds, i) => {
          const point = this.chartPoints[i];
          ds.data[0] = i === closest ? {...point, r: point.r * 1.5 } : point;
        });
      }
    };
  }

  private get onDragEnd() {
    return (event: MouseEvent, datasetIndex: number, index: number, value: any) => {
      // update layout with new position of dragged bubble
      const point = toChartPoint(this.dragState.element);
      this.layout[datasetIndex] = { x: point.x as number , y: point.y as number };

      // merge bubbles if intersecting
      if (this.dragState.isIntersected && this.mergeOnDrop) {
        const i = this.dragState.closest;
        const draggedGroup = this.groups[datasetIndex];
        const closestGroup = this.groups[i];
        const removedCoordinate = this.layout.splice(i, 1)[0]; // remove coordinate of merged group from layout
        this.model.merge(draggedGroup, closestGroup);
        this.snackBar.open(`Assigned '${closestGroup.name}' to '${draggedGroup.name}'`, 'undo', { duration: 5000 })
          .onAction()
          .subscribe(
            () => {
              this.model.split(draggedGroup, closestGroup);
              this.layout.splice(this.groups.length, 0, removedCoordinate);
              this.update();
            }
          );
        this.update();
      }
      this.dragState.reset();
    };
  }
}

interface PseudoElement {
  _chart: Chart;
  _datasetIndex: number;
}

function toChartPoint(element: PseudoElement) {
  return element._chart.data.datasets[element._datasetIndex].data[0] as ChartPoint;
}

class DragState {
  /** The element being dragged. */
  public element: PseudoElement = null;
  /** Dataset indices of elements intersecting the dragged element. */
  public intersectingElements: number[] = [];
  /** Returns the closest point to the dragged element, -1 if none was intersected. */
  public get closest(): number {
    return this.isIntersected ? this.intersectingElements[0] : -1;
  }
  public get isIntersected(): boolean {
    return this.intersectingElements.length > 0;
  }
  public reset() {
    this.element = null;
    this.intersectingElements = [];
  }
  /**
   * Finds all ChartPoints in the dataset, intersecting the current element. \
   * Ratios are needed if dataset's scale differs from canvas size.
   * Returns dataset index of closest ChartPoint.
   */
  public findIntersectingPoints(xRatio = 1, yRatio = 1) {
    if (!this.element) {
      return;
    }
    const point = toChartPoint(this.element);
    // TODO: move to utils.
    const distanceToPoint = (other) => {
      const dx2 = Math.pow((point.x as number - other.x) * xRatio, 2);
      const dy2 = Math.pow((point.y as number - other.y) * yRatio, 2);
      return Math.sqrt(dx2 + dy2);
    };
    const intersects = (other) => {
      return distanceToPoint(other) < other.r;
    };
    this.intersectingElements = this.element._chart.data.datasets
      .map(e => e.data[0]) // ChartPoint
      .map((p, i) => intersects(p) ?  i : -1)
      .filter(i => i !== this.element._datasetIndex && i > -1);
    return this.intersectingElements[0];
  }
}

class Bubble {
  private static readonly minimumSize = 2;
  private static readonly scalingFactor = Bubble.minimumSize * 100;

  /** Position on x-axis. */
  public xPosition: number;
  /** Position on y-axis. */
  public yPosition: number;
  /** Size of the bubble. */
  public size: number;
  /** Name of the facet.  */
  public label: string;
  /** Ratio of sentiments, -1 to 1. */
  public sentimentRatio: number;

  constructor(xPosition: number, yPosition: number, size: number, label: string, sentimentRatio: number) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.size = size;
    this.label = label;
    this.sentimentRatio = sentimentRatio;
  }

  /**
   * Generates Bubble with random coordinate from ExtractionGroup.
   * @param group the group to convert to a bubble.
   * @param valueMapper maps group to a value, representing the size of the Bubble.
   */
  public static fromExtractionGroup(group: ExtractionGroup, x: number, y: number, valueMapper: (g: ExtractionGroup) => number) {
    const value = valueMapper(group);
    const size = Bubble.scale(value);
    const name = group.name;
    const ratio = sentimentDifferential(group.extractions);
    return new Bubble(x, y, size, name, ratio);
  }
  public static fromLayout(groups: ExtractionGroup[], layout: Coordinate[], valueMapper: (g: ExtractionGroup) => number) {
    if (groups.length > layout.length) {
      throw new Error(`too few points provided! got ${layout.length}, need ${groups.length}`);
    }
    return groups.map((group, i) => {
      const x = layout[i].x;
      const y = layout[i].y;
      return Bubble.fromExtractionGroup(group, x, y, valueMapper);
    });
  }

  public static scale(value: number): number {
    // TODO: add to utils.makeInterpolator
    return Math.sqrt(value) * Bubble.scalingFactor + Bubble.minimumSize;
  }

  // TODO when embeddings are there
  public static fromExtractions(extractions: Extraction[]): Bubble[] {
    return [];
  }
}
