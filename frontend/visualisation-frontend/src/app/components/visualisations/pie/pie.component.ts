import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Extraction, ExtractionProperty, Extractions, StringMap } from 'src/app/models/canonical.js';
import { Sentiments } from 'src/app/models/sentiment.js';
import { flatten } from 'src/app/models/utils';
import { DefaultColorStrings } from 'src/environments/constants';
import {FacetType} from '../../../models/canonical';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() extractions: Extraction[];
  @Input() by: ExtractionProperty = 'sentiment';
  @Input() enableTooltips = true;
  @Input() animate = true;

  @Output() public clicked: EventEmitter<string> = new EventEmitter();

  private sentimentGroups: StringMap<Extraction[]>;
  private chartLabels: Label[];
  private chartData: number[] = [];
  private chartType: ChartType = 'pie';
  private chartLegend = false;
  private chartOptions: ChartOptions;
  private chartColors;

  ngOnInit() {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  public update() {
    this.sentimentGroups = Extractions.groupBy(this.extractions, 'sentiment');
    if (this.by === 'sentiment') {
      this.chartData = Sentiments.map(sentiment => this.sentimentGroups[sentiment] || [])
        .map(sentimentArray => sentimentArray.length);
      this.chartColors = [{
          backgroundColor: Sentiments.map(sentiment => DefaultColorStrings.backgroundColor[sentiment]),
          borderColor: Sentiments.map(sentiment => DefaultColorStrings.borderColor[sentiment]),
          hoverBackgroundColor: Sentiments.map(sentiment => DefaultColorStrings.hoverBackgroundColor[sentiment])
      }];
      this.chartLabels = Sentiments;
    } else {
      this.chartData = this.getChartData();
      this.chartColors = this.getChartColors();
      this.chartLabels = this.getChartLabels();
    }
    this.chartOptions = {
      animation: { animateRotate: this.animate, animateScale: this.animate },
      responsive: true,
      aspectRatio: 1,
      legend: { position: 'bottom' },
      tooltips: { enabled: this.enableTooltips },
      hover: {
      onHover: (event: any, chartElement) => {
        event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
      }
    }
    };
  }

  public chartClicked(event: any, facetType: FacetType): void {
    if (event.active.length > 0) {
      const chart = event.active[0]._chart;
      const activePoints = chart.getElementAtEvent(event.event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex];
        this.clicked.emit(label);
      }
    }
  }

  private getChartData() {
    const sentimentExtractions = Object.values(this.sentimentGroups)
    .map(se => Extractions.groupByFlat(se, this.by).map(e => e.length));
    return flatten(sentimentExtractions).reverse();
  }

  private getChartColors() {
    const sentiments = Object.entries(this.sentimentGroups)
    .map(entry => {
      const sentiment = entry[0];
      const extractions = entry[1];
      const sentimentExtractions = Extractions.groupByFlat(extractions, this.by);
      return sentimentExtractions.map(e => sentiment);
    });
    const flatSentiments = flatten(sentiments);
    return [{
      backgroundColor: flatSentiments.map(sentiment => DefaultColorStrings.backgroundColor[sentiment]).reverse(),
      borderColor: flatSentiments.map(sentiment => DefaultColorStrings.borderColor[sentiment]).reverse(),
      hoverBackgroundColor: flatSentiments.map(sentiment => DefaultColorStrings.hoverBackgroundColor[sentiment]).reverse()
    }];
  }

  private getChartLabels() {
    const subGroups = Object.entries(this.sentimentGroups)
    .map(entry => {
      const sentiment = entry[0];
      const extractions = entry[1];
      const sentimentExtractions = Extractions.groupBy(extractions, this.by);
      return Object.keys(sentimentExtractions);
    });
    return flatten(subGroups).reverse();
  }
}
