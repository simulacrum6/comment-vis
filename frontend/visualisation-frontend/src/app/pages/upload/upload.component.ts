import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import { default as reviews } from 'src/app/models/reviews.ce.json';
import { default as evaluations } from 'src/app/models/evaulations.ce.json';
import { MatSelectChange } from '@angular/material';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  private readonly demoDatasets = [
    { viewValue: 'Foursquare Reviews', value: foursquare },
    { viewValue: 'Amazon, Yelp, IMDB Reviews', value: reviews },
    { viewValue: 'Lecture Evaluations', value: evaluations }
  ];

  private _dataset: any;

  get dataset() {
    if (this._dataset === undefined) {
      return [];
    }

    return this._dataset;
  }

  set dataset(value: any) {
    if (value instanceof MatSelectChange) {
      this._dataset = value.value;
    } else {
      this._dataset = value;
    }

    this.modelService.generateModelFromJson(this._dataset);
  }

  constructor(private router: Router, private ar: ActivatedRoute, private modelService: ModelService) {}

  ngOnInit() {
  }

  submit(): void {
    this.router.navigate(['stats']);
  }
}
