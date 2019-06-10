import { Component, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { default as rawData } from '../../../models/mock2.ce.json';
import { Aspect, Extraction, Extractions } from 'src/app/models/canonical.js';
import { ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

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
  public chartOptions: ChartOptions = {
    responsive: true,
    legend: { position: 'top' },
  };
  public chartLabels: Label[] = [];
  public chartData: number[] = [];
  public chartType: ChartType = 'pie';
  public chartLegend = true;
  public chartColors = [];
  
  private aspect: Aspect;

  constructor(private model: ModelService) {
    // read mock data if model is empty
    if (!model.model) {
      model.generateModelFromJson(rawData);
    }
    this.aspect = model.model.aspects[1];
    let aspectExtractions = Extractions.groupBy(model.model.rawExtractions, 'aspect', 'group');
    console.log(aspectExtractions[this.aspect.name]);
    console.log(this.aspect.extractions);
    console.log(aspectExtractions);
    console.log(model.model.rawExtractions)

  }

  ngOnInit() { 
    this.chartLabels = this.aspect.extractions.map(e => e.attribute.text);
    this.chartColors = [{ 
      backgroundColor: this.aspect.extractions.map(e => chartColors.background[e.sentiment]),
      borderColor: this.aspect.extractions.map(e => chartColors.background[e.sentiment])
    }]
    this.chartData = this.aspect.extractions.map(e => 1);
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
