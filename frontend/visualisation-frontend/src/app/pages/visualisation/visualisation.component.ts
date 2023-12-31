import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  public readonly visualisationLinks = [
    { path: 'explore', label: 'Explore'},
    { path: 'pie', label: 'Compare'},
    { path: 'inspect', label: 'Inspect'}
  ];

  constructor(private stateService: StateService, private snackBar: MatSnackBar, private router: Router) {
    this.stateService.loadSafe();
  }

  ngOnInit() { }
}
