import { Component, OnInit, Input } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { default as rawData } from 'src/app/models/mock2.ce.json';
import { Extraction, Extractions, StringMap } from 'src/app/models/canonical.js';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Sentiment, Sentiments } from 'src/app/models/sentiment.js';

const chartColors = {
  background: {
    negative: 'rgba(255, 0, 0, 0.3)',
    neutral: 'rgba(169, 169, 169, 0.3)',
    positive: 'rgba(0, 163, 51, 0.3)',
  },
  border: {
    negative: 'rgb(255, 0, 0)',
    neutral: 'rgb(169, 169, 169)',
    positive: 'rgb(0, 163, 51)'
  }
};

@Component({
  selector: 'app-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss']
})
export class PieComponent implements OnInit {
  @Input() facetType: 'aspect' | 'attribute';
  @Input() name: string;
  @Input() extractions: Extraction[];

  private sentimentGroups: StringMap<Extraction[]>;

  private chartOptions: ChartOptions = {
    responsive: true,
    legend: { position: 'top' },
  };
  private chartLabels: Label[] = [];
  private chartData: number[] = [];
  private chartType: ChartType = 'pie';
  private chartLegend = true;
  private chartColors = [];

  constructor(private modelService: ModelService) {
    // read mock data if model is empty
    if (!modelService.model) {
      modelService.generateModelFromJson(rawData);
    }
  }

  ngOnInit() {
    this.sentimentGroups = Extractions.groupBy(this.extractions, 'sentiment');

    this.chartLabels = Sentiments;
    this.chartColors = [{
      backgroundColor: Sentiments.map(sentiment => chartColors.background[sentiment]),
      borderColor: Sentiments.map(sentiment => chartColors.background[sentiment])
    }];
    this.chartData = Sentiments.map(sentiment => this.sentimentGroups[sentiment] || [])
      .map(sentimentArray => sentimentArray.length);
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  changeLegendPosition() {
    this.chartOptions.legend.position = this.chartOptions.legend.position === 'left' ? 'top' : 'left';
  }
}
