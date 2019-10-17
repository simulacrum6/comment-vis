import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';
import { FilterOption, FilterType, FilterOptions, FilterGenerator } from 'src/app/services/filter';
import { Subscription, combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
import { ExtractionGroup } from 'src/app/models/canonical';
import { Coordinate, LayoutService, LayoutName } from 'src/app/services/layout.service';
import { map} from 'rxjs/operators';
import { occurencePercentage } from 'src/app/components/controls/size-scaling/size-scaling.component';
import { MatSliderChange } from '@angular/material';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/stats']},
    { name: 'Explore', path: ['/vis/explore/']}
  ];

  private availableFilters = [
    { name: 'Topics', filters: FilterOptions.groups.topics},
    { name: 'Sentiment', filters: FilterOptions.groups.sentiment}
  ];

  private subs: Subscription = new Subscription();

  public groups: BehaviorSubject<ExtractionGroup[]> = new BehaviorSubject([]);
  public names: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public layoutName: BehaviorSubject<LayoutName> = new BehaviorSubject('random' as LayoutName);
  private layout: Observable<Coordinate[]>;
  private scalingFunction: (g: ExtractionGroup) => number;
  private maximumMentions: number;
  private minimumMentions: number;

  constructor(
    private filterService: FilterService,
    private route: ActivatedRoute,
    private stateService: StateService,
    private layoutService: LayoutService) {
    if (this.filterService.data === undefined) {
      this.filterService.data = this.stateService.model.state.getGroupsFor(this.stateService.facetType.state);
    }
    this.scalingFunction = occurencePercentage(this.stateService.model.state.extractions.length);
  }

  ngOnInit() {
    // set up url for return from detail page.
    this.subs = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });

    // observables for layouting
    const filterSub = this.filterService.filteredDataChange.subscribe(this.groups);
    const nameSub = this.groups.pipe(
      map(gs => gs.map(g => g.name))
    ).subscribe(this.names);
    this.layout = this.layoutService.layoutChanges;
    const layoutSub = combineLatest(this.names, this.layoutName).subscribe(
      ([names, layout]) => this.layoutService.getLayout(names, layout)
    );

    this.subs.add(layoutSub);
    this.subs.add(filterSub);
    this.subs.add(nameSub);

    // calculate maximum mentions
    const type = this.stateService.facetType.state;
    const groups = this.stateService.model.state.getGroupsFor(type);
    this.maximumMentions = groups
      .map(g => g.extractions.length)
      .reduce((a, b) => Math.max(a, b), 0);
    const filter = this.filterService.getFilterById('minimum_mentions_slider');
    this.minimumMentions = filter !== null ? filter.value : 0;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public onFilterRemoval(removeEvent: { option: FilterOption, type: FilterType }) {
    this.filterService.remove(removeEvent.option, removeEvent.type);
  }

  public onFilterChange($event: FilterOption) {
    this.filterService.add($event);
  }

  public onFilterClear() {
    this.filterService.clearFilters();
  }

  public onScalingChange(event: { value: (g: ExtractionGroup) => number }) {
    this.scalingFunction = event.value;
  }

  public onLayoutChange(event: { value: LayoutName }) {
    this.layoutName.next(event.value);
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
