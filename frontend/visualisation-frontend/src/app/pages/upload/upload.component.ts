import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import {Model} from 'src/app/models/canonical';
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
  private uploadedInvalidDataset: boolean;

  set dataset(dataset: any) {
    if (dataset instanceof MatSelectChange) {
      this.model = DemoModels.getModel(dataset.value);
    } else {
      this.model = Model.fromJson(dataset);
    }
    this.uploadedInvalidDataset = !this.model;
  }

  constructor(private router: Router, private ar: ActivatedRoute, private stateService: StateService) {
    this.stateService.loadSafe();
  }

  ngOnInit() { }

  submit(): void {
    this.stateService.clear();
    this.stateService.model.state = this.model;
    this.router.navigate(['stats']);
  }

  handleFileInput(files: FileList) {
    if (files.length < 1) {
      return;
    }

    const file = files.item(0);
    const fileReader = new FileReader();

    fileReader.onloadend = event => {
      console.log('uploaded file: ' + fileReader.result);
      try {
        this.dataset = JSON.parse(fileReader.result);
      } catch (exception) {
        this.uploadedInvalidDataset = true;
      }
    };
    fileReader.readAsText(file, 'utf-8');
  }
}
