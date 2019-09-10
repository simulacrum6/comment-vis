import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType, ChartPoint} from 'chart.js';
import {Extraction, Model, ExtractionProperty, ExtractionGroup, sentimentDifferential, FacetType} from '../../models/canonical';
import { getMixedWeightedSentimentColor, controversy } from '../../models/sentiment';
import { default as Color } from 'color';
import { StateService } from 'src/app/services/state.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart } from 'chart.js';
import 'chartjs-plugin-zoom';
import 'chartjs-plugin-dragdata';

@Component({
  selector: 'app-embeddings',
  templateUrl: './embeddings.component.html',
  styleUrls: ['./embeddings.component.scss']
})
export class EmbeddingsComponent implements OnInit, OnDestroy {
  public static readonly ScaleMin = 0;
  public static readonly ScaleMax = 100;

  public groups: ExtractionGroup[] = [];

  @ViewChild('chart')
  private chartDirective: BaseChartDirective;

  private mergeOnDrop = true;
  private urlSub: Subscription = new Subscription();
  private model: Model = null;
  private type: ExtractionProperty = 'aspect';
  private bubbles: Bubble[] = [];
  private chartType: ChartType = 'bubble';
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
        ticks: { beginAtZero: true, min: EmbeddingsComponent.ScaleMin, max: EmbeddingsComponent.ScaleMax, display: false },
        gridLines: { display: false }
      }],
      yAxes: [{
        ticks: { beginAtZero: true, min: EmbeddingsComponent.ScaleMin, max: EmbeddingsComponent.ScaleMax, display: false },
        gridLines: { display: false }
      }]
    },
    layout: {
      // Padding so values on the edge are not easily cut off
      padding: { left: 20, right: 20, top: 20, bottom: 20 }
    },
    plugins: {
      zoom: {
        pan: { enabled: false, mode: 'xy' },
        zoom: { enabled: false, drag: false, mode: 'xy', speed: 0.1, }
      }
    }
  };
  private chartData: ChartDataSets[] = [];
  private dragState: DragState = new DragState();
  private copyPoints: ChartPoint[] = []

  private get chart(): Chart {
    return this.chartDirective.chart;
  }
  private get canvas(): HTMLElement {
    return (this.chartDirective as any).element.nativeElement as HTMLElement;
  }

  constructor(private stateService: StateService, private router: Router, private route: ActivatedRoute) {

    // set up url for return from detail page.
    this.urlSub = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });
  }

  ngOnInit() {
    this.update();
  }

  ngOnDestroy(): void {
    this.urlSub.unsubscribe();
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
    this.bubbles = this.groups.map(group => Bubble.fromExtractionGroup(group, controversial));
    this.fillChartData(this.bubbles);
  }

  public handleBubbleClick({ event, active }: { event: MouseEvent, active: any[] }) {
    if (active.length > 0) {
      const chart: Chart = active[0]._chart;
      const activePoints: any[] = chart.getElementAtEvent(event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._datasetIndex;
        const label = chart.data.datasets[clickedElementIndex].label;
        this.navigateToDetailPage(label, this.stateService.facetType.state);
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
    this.copyPoints = this.chartData
      .map(ds => ds.data[0] as ChartPoint)
      .map((dp: ChartPoint) => ({...dp}));
  }

  private get onDragStart() {
    return (event: MouseEvent, element: PseudoElement) => {
      this.dragState.element = element;
      console.log(toChartPoint(element));
    };
  }

  private get onDrag() {
    return (event: MouseEvent, datasetIndex: number, index: number, value: any) => {
      const widthRatio = this.dragState.element._chart.canvas.width / EmbeddingsComponent.ScaleMax;
      const heigthRatio = this.dragState.element._chart.canvas.height / EmbeddingsComponent.ScaleMax;

      const intersected = this.dragState.findIntersectingPoints(widthRatio, heigthRatio)[0];
      this.chart.data.datasets.forEach((ds, i) => {
        const copy = this.copyPoints[i];
        ds.data[0] = i === intersected ? {...copy, r: copy.r * 1.5 } : copy;
      });
    };
  }

  private get onDragEnd() {
    return (event: MouseEvent, datasetIndex: number, index: number, value: any) => {
      if (this.dragState.intersected.length === 0) {
        return;
      }

      // merge bubble with first intersected bubble, should probably get the closest one, though...
      const group = this.groups[datasetIndex];
      const i = this.dragState.intersected[0];
      const intersected = this.groups[i];
      if (this.dragState.intersected.length > 0 && this.mergeOnDrop) {
        console.log(`merging ${intersected.name} into ${group.name}`);
        this.model.merge(group, intersected);
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
  public element: PseudoElement = null;
  public intersected: number[] = [];

  public reset() {
    this.element = null;
    this.intersected = [];
  }

  /**
   * Finds all ChartPoints in the dataset, intersected by the current element;
   */
  public findIntersectingPoints(xRatio = 1, yRatio = 1) {
    if (!this.element) {
      return;
    }

    const point = toChartPoint(this.element);
    // euclidean distance to point, mapped to canvas space...
    const distanceToPoint = (other) => {
      const dx2 = Math.pow((point.x as number - other.x) * xRatio, 2);
      const dy2 = Math.pow((point.y as number - other.y) * yRatio, 2);
      return Math.sqrt(dx2 + dy2);
    };
    // intersects if distance is smaller than the point's radius
    const intersects = (other) => {
      return distanceToPoint(other) < point.r;
    };

    this.intersected = this.element._chart.data.datasets
      .map(e => e.data[0]) // ChartPoint
      .map((p, i) => intersects(p) ?  i : -1)
      .filter(i => i !== this.element._datasetIndex && i > -1);
    return this.intersected;
  }
}

class Bubble {
  private static readonly minimumSize = 2;
  private static readonly scalingFactor = Bubble.minimumSize * 100;

  // Position on x-axis - values 0 - 100
  xPosition: number;
  // Position on y-axis - values 0 - 100
  yPosition: number;
  // Relative quantity of mentions - values 0 - 100
  size: number;
  // Name of the facet
  label: string;
  // Ratio of sentiments - values -1 to 1
  sentimentRatio: number;

  constructor(xPosition: number, yPosition: number, size: number, label: string, sentimentRatio: number) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.size = size;
    this.label = label;
    this.sentimentRatio = sentimentRatio;
  }

  public static scale(value: number): number {
    // TODO: add to utils.makeInterpolator
    return Math.sqrt(value) * Bubble.scalingFactor + Bubble.minimumSize;
  }

  /**
   * Generates Bubble with random coordinate from ExtractionGroup.
   * @param group the group to convert to a bubble.
   * @param valueMapper maps group to a value, representing the size of the Bubble.
   */
  public static fromExtractionGroup(group: ExtractionGroup, valueMapper: (g: ExtractionGroup) => number) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const value = valueMapper(group);
    const size = Bubble.scale(value);
    const name = group.name;
    const ratio = sentimentDifferential(group.extractions);
    return new Bubble(x, y, size, name, ratio);
  }

// TODO when embeddings are there
  public static fromExtractions(extractions: Extraction[]): Bubble[] {
    return [];
  }
}
