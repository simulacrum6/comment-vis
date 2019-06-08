import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {ModelService} from '../../../services/model.service';
import {Aspect} from './model';
import mockData from '../mock.json';
import {Label} from 'ng2-charts';
import {ModelTransformation} from './modeltransformation';
import {MatOption} from '@angular/material';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {

  private aspects: Aspect[];
  private modelTransformation: ModelTransformation;

  @ViewChild('sortValue') sortValue: MatOption;
  @ViewChild('sortOrderValue') sortOrderValue: MatOption;
  @ViewChild('prevalenceValue') prevalenceValue: MatOption;

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
    {value: 'noone', viewValue: 'No Sorting'},
    {value: 'positive', viewValue: 'Positive Sentiments'},
    {value: 'neutral', viewValue: 'Neutral Sentiments'},
    {value: 'negative', viewValue: 'Negative Sentiments'}
  ];

  sortOrderOptions: any = [
    {value: 'ascending', viewValue: 'Ascending'},
    {value: 'descending', viewValue: 'Descending'},
  ];

  prevalenceOptions: any = [
    {value: 'absolute', viewValue: 'Absolute'},
    {value: 'relative', viewValue: 'Relative'},
  ];

  constructor(private modelService: ModelService) {
    this.modelTransformation = new ModelTransformation(this);
    this.generateAspectsFromMock();
  }

  generateAspectsFromMock() {
    this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
    this.rebuildChartData();
  }

  rebuildChartData() {
    // This is dumb, but for some reason ngAfterViewInit throws exceptions so we go with this...
    if (this.sortValue === undefined || this.sortOrderValue === undefined || this.prevalenceValue === undefined) {
      this.modelTransformation.buildChartData(this.aspects);
    } else {
      this.modelTransformation.buildChartData(this.aspects, this.sortValue.value.toString(), this.sortOrderValue.value.toString(),
        this.prevalenceValue.value.toString());
    }
    // this.modelTransformation.buildChartData(this.aspects, );
  }

}
