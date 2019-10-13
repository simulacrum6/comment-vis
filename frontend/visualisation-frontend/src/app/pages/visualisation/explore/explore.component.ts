import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';
import { FilterOption, FilterType, FilterOptions } from 'src/app/services/filter';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
import { ExtractionGroup } from 'src/app/models/canonical';
import { Coordinate, LayoutService, LayoutName } from 'src/app/services/layout.service';
import { map, switchMap } from 'rxjs/operators';
import { occurencePercentage } from 'src/app/components/controls/size-scaling/size-scaling.component';

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

  public groups: Observable<ExtractionGroup[]>;
  public layoutName: LayoutName = 'random';
  private layout: Observable<Coordinate[]>;
  private scalingFunction: (g: ExtractionGroup) => number;

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
    this.groups = this.filterService.filteredDataChange;
    this.layout = this.layoutService.layoutChanges;

    // set up url for return from detail page.
    this.subs = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });

    const layoutSub = this.groups.pipe(
      map(groups => groups.map(g => g.name))
    ).subscribe(
      names => this.layoutService.getLayout(names, this.layoutName)
    );

    this.subs.add(layoutSub);
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
}
