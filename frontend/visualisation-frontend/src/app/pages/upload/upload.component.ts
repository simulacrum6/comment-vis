import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Model } from 'src/app/models/canonical';
import { DemoModel, DemoModels } from 'src/app/models/demo';
import { FilterService } from 'src/app/services/filter.service';
import { StateService } from 'src/app/services/state.service';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @ViewChild('upload') upload: ElementRef;

  private readonly demoDatasets = [
    { viewValue: '--', file: '', value: ''},
    { viewValue: 'Foursquare Reviews', value: 'foursquare' },
    { viewValue: 'Amazon, Yelp, IMDB Reviews', value: 'reviews' },
    { viewValue: 'Lecture Evaluations', value: 'evaluations' }
  ];

  private uploadedInvalidDataset: boolean;
  private noDatasetSelected: boolean;
  private demoValue = this.demoDatasets[0].value;
  private uploadJson: any = '';


  constructor(private router: Router, private ar: ActivatedRoute, private stateService: StateService, private filterService: FilterService, private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
    this.stateService.loadSafe();

    this.matIconRegistry.addSvgIcon(
      `questionmark`,
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/questionmark.svg")
    );
  }

  ngOnInit() { }

  handleFileUpload(files: FileList) {
    if (files.length < 1) {
      this.resetUpload();
      return;
    }

    this.resetDemoValue();

    const file = files.item(0);
    const fileReader = new FileReader();

    this.uploadedInvalidDataset = false;
    fileReader.onloadend = () => {
      console.log('uploaded file: ' + fileReader.result);
      try {
        this.uploadJson = JSON.parse(fileReader.result as string);
      } catch (exception) {
        this.resetUpload();
        this.uploadJson = '';
        this.uploadedInvalidDataset = true;
      }
    };
    fileReader.readAsText(file, 'utf-8');
  }

  private getDemoFileForString(value: string): DemoModel {
    switch (value) {
      case 'foursquare': return DemoModel.Foursquare;
      case 'reviews': return DemoModel.Reviews;
      case 'evaluations': return DemoModel.Evaluations;
      default: return null;
    }
  }

  private resetUpload() {
    this.upload.nativeElement.value = '';
    this.uploadJson = '';
    this.uploadedInvalidDataset = false;
  }

  private resetDemoValue() {
    this.demoValue = '';
  }

  submit(): void {
    if (!this.uploadJson && !this.demoValue) {
      this.noDatasetSelected = true;
      return;
    }

    let model: Model;
    if (this.uploadJson) {
      model = Model.fromJson(this.uploadJson);
    } else if (this.demoValue) {
      model = DemoModels.getModel(this.getDemoFileForString(this.demoValue));
    } else {
      return;
    }

    this.stateService.clear();
    this.filterService.clearFilters();
    this.stateService.model.state = model;
    this.router.navigate(['stats']);
  }

  handleUploadFormatHelpClick() {
    this.router.navigate(['format']);
  }
}
