import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';
import { FilterOption, FilterType, FilterOptions, FilterGenerator } from 'src/app/services/filter';
import { Subscription, combineLatest, Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StateService } from 'src/app/services/state.service';
import { ExtractionGroup, Model, FacetType, FacetTypes } from 'src/app/models/canonical';
import { Coordinate, LayoutService, LayoutName } from 'src/app/services/layout.service';
import { map} from 'rxjs/operators';
import { occurencePercentage } from 'src/app/components/controls/size-scaling/size-scaling.component';
import { MatSliderChange, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {

  public breadCrumbPaths = [
    { name: 'Upload', path: ['/']},
    { name: 'Statistics', path: ['/stats']},
    { name: 'Explore', path: ['/vis/explore/']}
  ];

  public availableFilters = [
    { name: 'Sentiment', filters: FilterOptions.groups.sentiment}
  ];

  private subs: Subscription = new Subscription();

  public model: Model;
  public groups: BehaviorSubject<ExtractionGroup[]> = new BehaviorSubject([]);
  public names: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public layoutName: BehaviorSubject<LayoutName> = new BehaviorSubject('random' as LayoutName);
  public layout: BehaviorSubject<Coordinate[]> = new BehaviorSubject([]);
  public scalingFunction: (g: ExtractionGroup) => number;
  public maximumMentions: number;
  public minimumMentions: number;
  public facetType: FacetType = 'aspect';

  constructor(
    public filterService: FilterService,
    private route: ActivatedRoute,
    public stateService: StateService,
    private layoutService: LayoutService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    if (this.filterService.data === undefined) {
      this.filterService.data = this.stateService.model.state.getGroupsFor(this.stateService.facetType.state);
    }
    this.scalingFunction = occurencePercentage(this.stateService.model.state.extractions.length);
    this.model = this.stateService.model.state;
    this.facetType = this.stateService.facetType.state;

    // set up url for return from detail page.
    this.subs = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });

    // observables for layouting
    const filterSub = this.filterService.filteredDataChange.subscribe(this.groups);
    const nameSub = this.filterService.filteredDataChange.pipe(
      map(gs => gs.map(g => g.name))
    ).subscribe(this.names);
    const layoutSub = this.layoutService.layoutChanges.subscribe(this.layout);
    const layoutRequestSub = combineLatest(this.names, this.layoutName).subscribe(
      ([names, layout]) => this.layoutService.getLayout(names, layout)
    );
    this.filterService.filteredDataChange.subscribe((d)=> console.log(d[0]));

    this.subs.add(layoutRequestSub);
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

  public onFacetTypeChange() {
    this.facetType = FacetTypes.other(this.facetType);
    this.stateService.facetType.state = this.facetType;
    this.ngOnInit();
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

  public onMerge(event: { target: ExtractionGroup, mergee: ExtractionGroup, index: number}) {
    const layout = this.layout.getValue().slice();
    const removedCoordinate = layout.splice(event.index, 1)[0]; // remove coordinate of merged group from layout
    let groups = this.model.merge(event.target, event.mergee);
    groups = this.filterService.applyFilters(groups, false);
    this.snackBar.open(`Assigned '${event.mergee.name}' to '${event.target.name}'`, 'undo', { duration: 5000 })
      .onAction()
      .subscribe(
        () => {
          const oldGroups = this.model.split(event.target, event.mergee);
          layout.splice(groups.length, 0, removedCoordinate);
          this.layout.next(layout);
          this.groups.next(oldGroups);
        }
      );
    console.log(groups.length);
    console.log(layout.length);
    this.groups.next(groups);
    this.layout.next(layout);
  }
}
