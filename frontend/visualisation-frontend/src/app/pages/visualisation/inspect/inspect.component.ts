import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSliderChange } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ExtractionGroup } from 'src/app/models/canonical';
import { FilterGenerator, FilterOption, FilterOptions } from 'src/app/services/filter';
import { FilterService } from 'src/app/services/filter.service';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit {

  public comments: BehaviorSubject<ExtractionGroup[]> = new BehaviorSubject([]);

  public breadCrumbPaths = [
    { name: 'Upload', path: ['/']},
    { name: 'Statistics', path: ['/stats']},
    { name: 'Inspect', path: ['/vis/inspect/']}
  ];

  public availableFilters = [
    { name: 'Sentiment', filters: FilterOptions.groups.sentiment}
  ];

  public maximumMentions: number;
  public minimumMentions: number;

  constructor(public filterService: FilterService, public stateService: StateService) {}

  ngOnInit() {
    this.filterService.data = this.stateService.model.model.getGroupsFor('comment');

    // calculate maximum mentions
    const type = this.stateService.facetType.state;
    const groups = this.stateService.model.state.getGroupsFor(type);
    this.maximumMentions = groups
      .map(g => g.extractions.length)
      .reduce((a, b) => Math.max(a, b), 0);
    const filter = this.filterService.getFilterById('minimum_mentions_slider');
    this.minimumMentions = filter !== null ? filter.value : 0;
  }

  public onFilterChange(event: FilterOption) {
    this.filterService.add(event);
  }

  public onFilterClear() {
    this.filterService.clearFilters();
  }

  public onMinimumMentionsChange(change: MatSliderChange) {
    const filter = FilterGenerator.moreThanXMentions(change.value, 'minimum_mentions_slider');
    if (change.value > 0) {
      this.filterService.set(filter);
    } else {
      this.filterService.remove(filter);
    }
  }

  public onSort(event: ExtractionGroup[]) {
    this.comments.next(event);
  }
}
