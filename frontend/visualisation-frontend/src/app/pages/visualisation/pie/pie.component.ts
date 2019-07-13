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
  /** Maximum chart size in pixels. */
  private static readonly MaxSize = 640;

  /** Maximum chart size in pixels. */
  private static readonly MinSize = 24;

  @Input() facetType: 'aspect' | 'attribute';
  @Input() name: string;
  @Input() extractions: Extraction[];
  @Input() size = NaN;

  @ViewChild('chartWrapper') chartWrapper: ElementRef;

  private sentimentGroups: StringMap<Extraction[]>;
  private interpolator: Interpolator = makeInterpolator(PieComponent.MinSize, PieComponent.MaxSize, 'boundary');

  private chartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1,
    legend: { position: 'bottom' },
  };
  private chartLabels: Label[] = Sentiments;
  private chartData: number[] = [];
  private chartType: ChartType = 'pie';
  private chartLegend = false;
  private chartColors = [{
    backgroundColor: Sentiments.map(sentiment => DefaultColorStrings.backgroundColor[sentiment]),
    borderColor: Sentiments.map(sentiment => DefaultColorStrings.borderColor[sentiment]),
    hoverBackgroundColor: Sentiments.map(sentiment => DefaultColorStrings.hoverBackgroundColor[sentiment])
  }];

  ngOnInit() {
    this.setSize();
    this.sentimentGroups = Extractions.groupBy(this.extractions, 'sentiment');
    this.chartData = Sentiments.map(sentiment => this.sentimentGroups[sentiment] || [])
      .map(sentimentArray => sentimentArray.length);
  }

  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  /** Sets the size of the Pie Chart. */
  private setSize() {
    if (!isNaN(this.size)) {
      this.chartWrapper.nativeElement.style.width = this.interpolator(this.size).toFixed(0) + 'px';
      this.chartWrapper.nativeElement.style.height = this.chartWrapper.nativeElement.style.height;
    }
  }
}
