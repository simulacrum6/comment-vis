import {Component, OnInit} from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {ModelService} from '../../../services/model.service';
import {Aspect} from './model';
import mockData from '../mock.json';
import {Label} from 'ng2-charts';
import {ModelTransformation} from './modeltransformation';


/*import {Aspect, Extraction, Facet, FacetGroup} from '../../../models/canonical';
import {Sentiment, SentimentCount} from '../../../models/sentiment';*/

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  private aspects: Aspect[];
  private modelTransformation: ModelTransformation;

  public chartData: any = [];
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
    {value: 'ascending', viewValue: 'ascending'},
    {value: 'descending', viewValue: 'descending'},
  ];


  constructor(private modelService: ModelService) {
    this.modelTransformation = new ModelTransformation(this);
    this.generateAspectsFromMock();
  }

  generateAspectsFromMock() {
    this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
    this.modelTransformation.buildChartData(this.aspects);
  }

}
