import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { ModelService } from 'src/app/services/model.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  public readonly visualisationLinks = [
    { path: 'pie', label: 'Pie' },
    { path: 'tree', label: 'Tree' },
    { path: 'bar', label: 'Bar' }
  ];

  constructor(private modelService: ModelService, private snackBar: MatSnackBar, private router: Router) {
    this.modelService.ensureModelIsAvailable();
  }

  ngOnInit() { }
}
