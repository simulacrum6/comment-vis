import { Component, OnInit } from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Extraction} from '../../models/canonical';
import {getMixedWeightedSentimentColor} from '../../models/sentiment';
import Color = require('color');

@Component({
  selector: 'app-embeddings',
  templateUrl: './embeddings.component.html',
  styleUrls: ['./embeddings.component.scss']
})
export class EmbeddingsComponent implements OnInit {

  private bubbles: Bubble[];
  private chartData: ChartDataSets[] = [];
  private chartType: ChartType = 'bubble';
  private chartOptions: ChartOptions = {
    legend: {
      display: false
    },
    tooltips: {
      mode: 'point',
      intersect: true,
      callbacks: {
        label: (tooltipItem, data) => {
          return data.datasets[tooltipItem.datasetIndex].label || '';
        }
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 100,
          display: false
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 100,
          display: false
        }
      }]
    },
    layout: {
      // Padding so values on the edge are not easily cut off
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
      }
    }
  };


  constructor() { }

  ngOnInit() {
    this.bubbles = Bubble.generateExampleData();

    this.bubbles.forEach(bubble => {
      const dataset: any = {};
      dataset.data = [{
        x: bubble.xPosition,
        y: bubble.yPosition,
        r: bubble.size}];
      dataset.label = bubble.label;
      const color: Color = getMixedWeightedSentimentColor(bubble.sentimentRatio);
      dataset.backgroundColor = color.alpha(0.6).toString();
      dataset.hoverBackgroundColor = color.alpha(0.8).toString();
      dataset.borderColor = color.toString();
      dataset.hoverBorderColor = color.alpha(0.8).toString();
      this.chartData.push(dataset);
    });

    console.log(this.chartData);
  }

  // TODO: What should happen here
  handleBubbleClick(event: any) {}
}

class Bubble {

  // Position on x-axis - values 0 - 100
  xPosition: number;
  // Position on y-axis - values 0 - 100
  yPosition: number;
  // Relative quantity of mentions - values 0 - 100
  size: number;
  // Name of the facet
  label: string;
  // Ratio of sentiments - values -1 to 1
  sentimentRatio: number;

  constructor(xPosition: number, yPosition: number, size: number, label: string, sentimentRatio: number) {
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.size = size;
    this.label = label;
    this.sentimentRatio = sentimentRatio;
  }

// TODO when embeddings are there
  public static fromExtractions(extractions: Extraction[]): Bubble[] {
    return [];
  }

  public static generateExampleData(): Bubble[] {
    const bubble0 = new Bubble(0, 0, 0, 'bubble0', 0.1);
    const bubble1 = new Bubble(8, 8, 8, 'bubble1', 0.3);
    const bubble2 = new Bubble(16, 16, 16, 'bubble2', 0.5);
    const bubble3 = new Bubble(24, 24, 24, 'bubble3', 0.7);
    const bubble4 = new Bubble(32, 32, 32, 'bubble4', 1.0);
    const bubble5 = new Bubble(40, 40, 40, 'bubble5', 0);
    const bubble6 = new Bubble(48, 48, 48, 'bubble6', -0.1);
    const bubble7 = new Bubble(56, 56, 56, 'bubble7', -0.3);
    const bubble8 = new Bubble(64, 64, 64, 'bubble8', -0.5);
    const bubble9 = new Bubble(72, 72, 72, 'bubble9', -0.7);
    const bubble10 = new Bubble(100, 100, 4, 'bubble10', -1.0);
    return [bubble0, bubble1, bubble2, bubble3, bubble4, bubble5, bubble6, bubble7, bubble8, bubble9, bubble10];
  }

}
