import { Component, OnInit } from '@angular/core';
import mockData from '../../models/mock2.ce.json';
import {ModelService} from '../../services/model.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  constructor(private modelService: ModelService) { }

  ngOnInit() {
    this.modelService.generateModelFromJson(mockData); //TODO: delete later
  }

}
