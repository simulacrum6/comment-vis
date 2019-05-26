import {Component, OnInit, ViewChild} from '@angular/core';
import {Aspect} from './model';
import mockData from '../mock.json';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {
  aspects: Aspect[];
  @ViewChild('barChart') private chartRef;
  chart: any;

  constructor() {
      this.generateAspectsFromMock();
  }

  generateAspectsFromMock() {
      this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'horizontalBar',
      data: {
        datasets: [
          {
            label: 'Teacher',
            backgroundColor: 'rgba(210, 214, 222, 1)',
            data: [10, 20, 30, 40],
          },
        ],
        labels: ['Cool', 'Lazy', 'Nice', 'Boring']
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

}
