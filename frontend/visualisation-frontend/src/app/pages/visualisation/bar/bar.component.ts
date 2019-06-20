import {Component, Input, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {ModelService} from '../../../services/model.service';
import {Label} from 'ng2-charts';
import {ModelTransformation} from './modeltransformation';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  @Input('aspectname') aspectname: string;
  private modelTransformation: ModelTransformation;

  private sortValue: string;
  private sortOrderValue: string;

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
          stepSize: 1
        },
        stacked: true
      }],
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

  constructor(public modelService: ModelService) {
    this.modelTransformation = new ModelTransformation(this);
    this.sortValue = this.sortOptions[0].value;
    this.sortOrderValue = this.sortOrderOptions[0].value;
  }

  ngOnInit() {
    this.rebuildChartData();
  }

  rebuildChartData() {
    this.modelTransformation.buildChartData(this.sortValue, this.sortOrderValue);
  }

  handleBarClick(event: any) {
    if (event.active.length > 0) {
      const chart = event.active[0]._chart;
      const activePoints = chart.getElementAtEvent(event.event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex];
        console.log('bar clicked: ' + label);
      }
    }
  }

}
