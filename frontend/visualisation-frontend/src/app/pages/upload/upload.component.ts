import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Model } from 'src/app/models/canonical';
import { DemoModel, DemoModels } from 'src/app/models/demo';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  private readonly demoDatasets = [
    { viewValue: 'Foursquare Reviews', value: DemoModel.Foursquare },
    { viewValue: 'Amazon, Yelp, IMDB Reviews', value: DemoModel.Reviews },
    { viewValue: 'Lecture Evaluations', value: DemoModel.Evaluations }
  ];

  private model: Model;

  set dataset(dataset: any) {
    if (dataset instanceof MatSelectChange) {
      this.model = DemoModels.getModel(dataset.value);
    } else {
      this.model = Model.fromJson(dataset);
    }
  }

  constructor(private router: Router, private ar: ActivatedRoute, private stateService: StateService) {}

  ngOnInit() { }

  submit(): void {
    this.stateService.clear();
    this.stateService.model.state = this.model;
    this.router.navigate(['stats']);
  }
}
