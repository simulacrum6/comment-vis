import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtractionGroup, Extractions } from 'src/app/models/canonical';
import { flatten } from 'src/app/models/utils';
import { FilterService } from 'src/app/services/filter.service';
import { FilterOption, FilterOptions, FilterGenerator } from 'src/app/services/filter';
import { MatSliderChange } from '@angular/material';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit {

  private comments: Observable<ExtractionGroup[]>;

  private breadCrumbPaths = [
    { name: 'Upload', path: ['/']},
    { name: 'Statistics', path: ['/stats']},
    { name: 'Inspect', path: ['/vis/inspect/']}
  ];

  private availableFilters = [
    { name: 'Topics', filters: FilterOptions.groups.topics},
    { name: 'Sentiment', filters: FilterOptions.groups.sentiment}
  ];

  private maximumMentions: number;
  private minimumMentions: number;

  constructor(private filterService: FilterService, private stateService: StateService) { }

  ngOnInit() {
    this.comments = this.filterService.filteredDataChange.pipe(
      map(filtered => flatten(filtered.map(group => group.extractions))),
      map(extractions => Extractions.toViewGroups(extractions, 'comment'))
    );

    // calculate maximum mentions
    const type = this.stateService.facetType.state;
    const groups = this.stateService.model.state.getGroupsFor(type);
    this.maximumMentions = groups
      .map(g => g.extractions.length)
      .reduce((a, b) => Math.max(a, b), 0);
    const filter = this.filterService.getFilterById('minimum_mentions_slider');
    this.minimumMentions = filter !== null ? filter.value : 0;
  }

  public onFilterChange($event: FilterOption) {
    this.filterService.add($event);
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
}
