import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectChange } from '@angular/material';
import { ModelService, DemoModel } from 'src/app/services/model.service';

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
      this.modelService.loadDemoModel(dataset.value);
    } else {
      this._dataset = dataset;
      this.modelService.generateModelFromJson(dataset);
    }
  }

  constructor(private router: Router, private ar: ActivatedRoute, private modelService: ModelService) {}

  ngOnInit() {

  }

  submit(): void {
    this.router.navigate(['stats']);
  }
}
