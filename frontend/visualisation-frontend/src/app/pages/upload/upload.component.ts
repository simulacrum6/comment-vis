import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
import { Model } from 'src/app/models/canonical';
import { DemoModel, DemoModels } from 'src/app/models/demo';

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

  private _dataset: any | DemoModel;

  get dataset() {
    if (this._dataset === undefined) {
      return null;
    }

    return this._dataset;
  }

  set dataset(dataset: any) {
    if (dataset instanceof MatSelectChange) {
      this._dataset = dataset.value;
      this.stateService.model.state = DemoModels.getModel(dataset.value);
    } else {
      this._dataset = dataset;
      this.stateService.model.state = Model.fromJson(dataset);
    }
  }

  constructor(private router: Router, private ar: ActivatedRoute, private stateService: StateService) {}

  ngOnInit() { }

  submit(): void {
    this.router.navigate(['stats']);
  }
}
