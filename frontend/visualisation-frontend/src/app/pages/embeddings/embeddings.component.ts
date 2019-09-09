import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType, ChartPoint} from 'chart.js';
import {Extraction, Model, ExtractionProperty, ExtractionGroup, sentimentDifferential, FacetType} from '../../models/canonical';
import { getMixedWeightedSentimentColor, controversy } from '../../models/sentiment';
import { default as Color } from 'color';
import { StateService } from 'src/app/services/state.service';
import { Router, ActivatedRoute } from '@angular/router';
import 'chartjs-plugin-zoom';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-embeddings',
  templateUrl: './embeddings.component.html',
  styleUrls: ['./embeddings.component.scss']
})
export class EmbeddingsComponent implements OnInit {

  private urlSub: Subscription;
  private model: Model;
  private type: ExtractionProperty;
  private bubbles: Bubble[];
  private chartData: ChartDataSets[] = [];
  private chartType: ChartType = 'bubble';
  private chartOptions: ChartOptions = {
    legend: { display: false },
    responsive: true,
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
        ticks: { beginAtZero: true, min: 0, max: 100, display: false },
        gridLines: { display: false }
      }],
      yAxes: [{
        ticks: { beginAtZero: true, min: 0, max: 100, display: false },
        gridLines: { display: false }
      }]
    },
    layout: {
      // Padding so values on the edge are not easily cut off
      padding: { left: 20, right: 20, top: 20, bottom: 20 }
    },
    plugins: {
      zoom: {
        pan: { enabled: true, mode: 'xy' },
        zoom: { enabled: true, drag: false, mode: 'xy', speed: 0.1, }
      }
    }
  };

  constructor(private stateService: StateService, private router: Router, private route: ActivatedRoute) {
    stateService.loadSafe();
    // set up url for return from detail page.
    this.urlSub = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });
  }

  ngOnInit() {
    this.model = this.stateService.model.state;
    this.type = this.stateService.facetType.state;
    const groups = this.model.getGroupsFor(this.type);
    const occurences = this.model.extractions.length;
    const occurencePercentage = (group: ExtractionGroup) => group.extractions.length / occurences;
    // alternative sizing functions.
    const positive = (g: ExtractionGroup) => sentimentDifferential(g.extractions) / 750;
    const clear = (g: ExtractionGroup) => Math.abs(positive(g)) * 3;
    const clearMinimumCount = (g: ExtractionGroup) => g.extractions.length > 3 ? clear(g) : 0;
    const controversial = (g: ExtractionGroup) => controversy(g.sentimentCount) / 1000;
    this.bubbles = groups.map(group => Bubble.fromExtractionGroup(group, controversial));

    this.bubbles.forEach(bubble => {
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
      this.chartData.push(dataset);
    });
  }

  // TODO: What should happen here
  handleBubbleClick(event: any) {
    if (event.active.length > 0) {
      const chart = event.active[0]._chart;
      const activePoints = chart.getElementAtEvent(event.event);
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

  public static generateExampleData(): Bubble[] {
    const bubble0 = new Bubble(0, 0, 0, 'bubble0', 0.1);
    const bubble1 = new Bubble(8, 8, 8, 'bubble1', 0.3);
    const bubble2 = new Bubble(16, 16, 16, 'bubble2', 0.5);
    const bubble3 = new Bubble(24, 24, 24, 'bubble3', 0.7);
    const bubble4 = new Bubble(32, 32, 32, 'bubble4', 1.0);
    const bubble5 = new Bubble(40, 40, 40, 'bubble5', 0);
    const bubble6 = new Bubble(48, 48, 48, 'bubble6', -0.1);
    const bubble7 = new Bubble(56, 56, 56, 'bubble7', -0.3);
    const bubble8 = new Bubble(64, 64, 64, 'bubble8', -0.5);
    const bubble9 = new Bubble(72, 72, 72, 'bubble9', -0.7);
    const bubble10 = new Bubble(100, 100, 4, 'bubble10', -1.0);
    return [bubble0, bubble1, bubble2, bubble3, bubble4, bubble5, bubble6, bubble7, bubble8, bubble9, bubble10];
  }

}
