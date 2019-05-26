import { Component, OnInit } from '@angular/core';
import {Aspect} from './model';
import mockData from '../mock.json';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss']
})
export class BarComponent implements OnInit {

  aspects: Aspect[];

  constructor() {
      this.generateAspectsFromMock();
  }

  generateAspectsFromMock() {
      this.aspects = Aspect.fromJson(mockData);
  }

  ngOnInit() {
  }

}
