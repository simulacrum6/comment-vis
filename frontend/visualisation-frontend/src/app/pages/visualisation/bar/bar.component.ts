import {Component, OnInit, ViewChild} from '@angular/core';
import {Aspect} from './model';
import mockData from '../mock.json';
import { Chart } from 'chart.js';
const Color = require('color');

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  aspects: Aspect[];
  @ViewChild('barChart') private chartRef;
  chart: any;

  chartColors = {
    red: 'rgb(255, 0, 0)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(0, 163, 51)',
  };

  constructor() {
      this.generateAspectsFromMock();
  }

  generateAspectsFromMock() {
      this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
    const labels = [];
    const dataSets = [];

    const positiveSentiments = [];
    const neutralSentiments = [];
    const negativeSentiments = [];

    this.aspects.forEach((aspect) => {
      aspect.bars.forEach((bar) => {
        labels.push(bar.attributeDescription);
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
      dataSet.label = label;
      dataSet.data = data;
      dataSets.push(dataSet);
    }

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'horizontalBar',
      data: {
        datasets: dataSets,
        labels: labels
      },
      options: {
        tooltips: {
          mode: 'index',
          intersect: false
        },
        responsive: true,
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
      }
    });
  }

}
