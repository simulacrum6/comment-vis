import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {ModelService} from '../../../services/model.service';
import {Aspect} from './model';
import mockData from '../mock.json';
import {Label} from 'ng2-charts';
import {ModelTransformation} from './modeltransformation';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {

  private aspects: Aspect[];
  private modelTransformation: ModelTransformation;

  private sortValue: string;
  private sortOrderValue: string;
  private prevalenceValue: string;

  public chartData: ChartDataSets[] = [];
  public chartType: ChartType = 'horizontalBar';
  public chartLabels: Label[] = [];
  public chartOptions: ChartOptions = {
    legend: {
      position: 'right'
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    scales: {
      yAxes: [{
        stacked: true
      }],
      xAxes: [{
        ticks: {
          beginAtZero: true,
        },
        stacked: true
      }]
    }
  };

  sortOptions: any = [
    {value: 'all', viewValue: 'All'},
    {value: 'positive', viewValue: 'Positive Sentiments'},
    {value: 'neutral', viewValue: 'Neutral Sentiments'},
    {value: 'negative', viewValue: 'Negative Sentiments'}
  ];

  sortOrderOptions: any = [
    {value: 'descending', viewValue: 'Descending'},
    {value: 'ascending', viewValue: 'Ascending'}
  ];

  prevalenceOptions: any = [
    {value: 'absolute', viewValue: 'Absolute'},
    {value: 'relative', viewValue: 'Relative'}
  ];

  constructor(private modelService: ModelService) {
    this.modelTransformation = new ModelTransformation(this);
    this.generateAspectsFromMock();
    this.sortValue = this.sortOptions[0];
    this.sortOrderValue = this.sortOrderOptions[0];
    this.prevalenceValue = this.prevalenceOptions[0];
  }

  generateAspectsFromMock() {
    this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
    this.rebuildChartData();
  }

  rebuildChartData() {
    this.modelTransformation.buildChartData(this.aspects, this.sortValue, this.sortOrderValue, this.prevalenceValue);
  }

}
