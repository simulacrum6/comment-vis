import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Extraction, Extractions, StringMap } from 'src/app/models/canonical.js';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Sentiments } from 'src/app/models/sentiment.js';
import { DefaultColorStrings } from 'src/environments/constants';
import { Interpolator, makeInterpolator } from 'src/app/models/utils';

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {

  @Input() name: string;
  @Input() extractions: Extraction[];

  private sentimentGroups: StringMap<Extraction[]>;
  private chartLabels: Label[] = Sentiments;
  private chartData: number[] = [];
  private chartType: ChartType = 'pie';
  private chartLegend = false;
  private chartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1,
    legend: { position: 'bottom' },
  };
  private chartColors = [{
    backgroundColor: Sentiments.map(sentiment => DefaultColorStrings.backgroundColor[sentiment]),
    borderColor: Sentiments.map(sentiment => DefaultColorStrings.borderColor[sentiment]),
    hoverBackgroundColor: Sentiments.map(sentiment => DefaultColorStrings.hoverBackgroundColor[sentiment])
  }];

  ngOnInit() {
    this.sentimentGroups = Extractions.groupBy(this.extractions, 'sentiment');
    this.chartData = Sentiments.map(sentiment => this.sentimentGroups[sentiment] || [])
      .map(sentimentArray => sentimentArray.length);
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }
}
