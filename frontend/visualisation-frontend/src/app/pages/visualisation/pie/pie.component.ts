import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Extraction, Extractions, StringMap, ExtractionProperty } from 'src/app/models/canonical.js';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Sentiments, Sentiment } from 'src/app/models/sentiment.js';
import { DefaultColorStrings } from 'src/environments/constants';
import { Interpolator, makeInterpolator, flatten } from 'src/app/models/utils';

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
      tooltips: { enabled: this.enableTooltips }
    }
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
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
