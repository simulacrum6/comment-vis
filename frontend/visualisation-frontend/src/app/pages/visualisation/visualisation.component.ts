import {Component, OnInit, ViewChild} from '@angular/core';
import { StateService } from 'src/app/services/state.service';
import {SearchFilterComponent} from '../../components/controls/filters/search-filter/search-filter.component';
import {FilterService} from '../../services/filter.service';

@Component({
  selector: 'app-visualisation',
  templateUrl: './visualisation.component.html',
  styleUrls: ['./visualisation.component.scss']
})
export class VisualisationComponent implements OnInit {

  public readonly visualisationLinks = [
    { path: 'explore', label: 'Explore', disabled: true, title: 'Explore'},
    { path: 'pie', label: 'Overview', disabled: false , title: `${this.stateService.facetType} - Overview`},
    { path: 'comments', label: 'Comments', disabled: true, title: 'Comments'}
  ];

  @ViewChild('searchReference')
  public searchReference: SearchFilterComponent;

  constructor(private stateService: StateService, private filterService: FilterService) {
    this.stateService.loadSafe();
  }

  ngOnInit() { }

  public test() {
    console.log('parent called!');
  }

  clearSearch() {
    this.searchReference.clearSearch();
  }
}
