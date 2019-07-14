import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../services/model.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';

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
      if (environment.production) {
        this.snackBar.open('No data was available. You were redirected to the upload page.', 'Okay', { duration: 3500 });
        this.router.navigate(['/']);
      } else {
        this.modelService.generateModelFromJson(foursquare);
      }
    }
  }

  ngOnInit() { }

  public navigate() {
  }
}
