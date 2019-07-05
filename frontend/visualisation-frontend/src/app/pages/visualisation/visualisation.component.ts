import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../services/model.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

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
    if (!this.modelService.model) {
      this.snackBar.open('No data was available. You were redirected to the upload page.', 'Okay', { duration: 3500 });
      this.router.navigate(['/']);
    }
  }

  ngOnInit() { }

  public navigate() {
  }
}
