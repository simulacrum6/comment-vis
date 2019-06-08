import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Chart, ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import Color from 'color';
import { ModelService} from '../../../services/model.service';
import { Aspect } from './model';
import mockData from '../mock.json';
import {ChartsModule, Label} from 'ng2-charts';


/*import {Aspect, Extraction, Facet, FacetGroup} from '../../../models/canonical';
import {Sentiment, SentimentCount} from '../../../models/sentiment';*/

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  aspects: Aspect[];

  /** Chart **/
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

  chartColors = {
    red: 'rgb(255, 0, 0)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(0, 163, 51)',
  };

  constructor(private modelService: ModelService) {
    this.generateAspectsFromMock();
  }

  generateAspectsFromMock() {
    this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
    const positiveSentiments = [];
    const neutralSentiments = [];
    const negativeSentiments = [];
    const unknownSentiments = [];

    this.aspects.forEach((aspect) => {
      aspect.bars.forEach((bar) => {
        this.chartLabels.push(bar.attributeDescription);
        positiveSentiments.push(bar.positiveSentimentCount);
        neutralSentiments.push(bar.neutralSentimentCount);
        negativeSentiments.push(bar.negativeSentimentCount);
      });
    });

    let borderColor: string;
    let label: string;
    let data = [];
    for (let i = 0; i < 3; i++) {
      if (i === 0) {
        borderColor = this.chartColors.green;
        label = 'Positive';
        data = positiveSentiments;
      } else if (i === 1) {
        borderColor = this.chartColors.yellow;
        label = 'Neutral';
        data = neutralSentiments;
      } else {
        borderColor = this.chartColors.red;
        label = 'Negative';
        data = negativeSentiments;
      }
      const dataSet: any = {};
      dataSet.borderColor = borderColor;
      dataSet.borderWidth = 3;
      dataSet.backgroundColor = Color(borderColor).alpha(0.3).string();
      dataSet.hoverBorderColor = Color(borderColor).string();
      dataSet.hoverBackgroundColor = Color(borderColor).alpha(0.6).string();
      dataSet.label = label;
      dataSet.data = data;
      this.chartData.push(dataSet);
    }
  }

}
