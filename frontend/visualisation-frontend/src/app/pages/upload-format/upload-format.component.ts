import { Component, OnInit } from '@angular/core';
import { default as exampleJson } from 'src/app/models/example.ce.json';

@Component({
  selector: 'app-upload-format',
  templateUrl: './upload-format.component.html',
  styleUrls: ['./upload-format.component.scss']
})
export class UploadFormatComponent implements OnInit {

  private example: string;

  private breadCrumbPaths = [
    { name: 'Upload', path: ['/']},
    { name: 'Upload Format', path: ['/format']}
  ];

  constructor() { }

  ngOnInit() {
    this.example =  exampleJson;
  }

}
