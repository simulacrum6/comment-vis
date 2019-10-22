import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange, MatSnackBar, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { SortState } from 'src/app/components/controls/filters/sort-filter/sort';
import { Extraction, ExtractionGroup, ExtractionProperty, FacetType, FacetTypes, Model } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { PaginatorConfig } from 'src/app/models/utils';
import { FilterGenerator, FilterOption, FilterOptions } from 'src/app/services/filter';
import { FilterService } from 'src/app/services/filter.service';
import { StateService } from 'src/app/services/state.service';
import { SearchFilterComponent } from '../../../components/controls/filters/search-filter/search-filter.component';


export class PieExtractionGroup implements ExtractionGroup {
  public id: string;
  public name: string;
  public type: ExtractionProperty;
  public extractions: Extraction[];
  public sentimentCount: SentimentCount;
  public sizeRatio = 0.25;

  constructor(id: string, name: string, type: ExtractionProperty, extractions: Extraction[], sentimentCount?: SentimentCount) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.extractions = extractions;
    this.sentimentCount = sentimentCount === undefined ? SentimentCount.fromExtractions(extractions) : sentimentCount;
  }

  static fromGroup(group: ExtractionGroup, scalingValue?: number): PieExtractionGroup {
    const pieGroup = new PieExtractionGroup(group.id, group.name, group.type, group.extractions, group.sentimentCount);
    if (scalingValue) {
      pieGroup.sizeRatio = pieGroup.extractions.length / scalingValue;
    }
    return pieGroup;
  }
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit, OnDestroy {

  public dragging = false;
  public facetGroups: ExtractionGroup[];
  private sortedFacetGroups: ExtractionGroup[];
  private searchedFacetGroups: ExtractionGroup[];
  public displayedFacetGroups: PieExtractionGroup[];
  public comparisonGroups: ExtractionGroup[] = [];
  private subscription = new Subscription();
  private totalExtractionCount: number;
  public maximumMentions: number;
  public minimumMentions: number;
  public availableFilters = [
    { name: 'Sentiment', filters: FilterOptions.groups.sentiment}
  ];

  private _pageConfig: PaginatorConfig;
  private _facetType: FacetType;
  public _facetTypeVisibleName: string;

  public get breadCrumbPaths() {
    return [
      { name: 'Upload', path: ['/']},
      { name: 'Statistics', path: ['/stats'], queryParams: {} },
      { name: FacetTypes.getVisibleName(this.facetType) + 's', path: ['/vis/pie'], queryParams: {} }
    ];
  }
  public get pageSizes() {
    return this._pageConfig.pageSizes;
  }
  public set pageSizes(sizes) {
    this._pageConfig.pageSizes = sizes;
  }
  public get currentPageSize() {
    return this._pageConfig.pageSize;
  }
  public set currentPageSize(size) {
    this._pageConfig.pageSize = size;
  }
  public get currentPageIndex() {
    return this._pageConfig.pageIndex;
  }
  public set currentPageIndex(index) {
    this._pageConfig.pageIndex = index;
  }
  public get groupCount() {
    return this._pageConfig.length;
  }
  public set groupCount(length) {
    this._pageConfig.length = length;
  }
  private get model(): Model {
    return this.stateService.model.state;
  }

  public get pageConfig() {
    return this._pageConfig;
  }
  public get facetType(): FacetType {
    return this._facetType;
  }

  @Input()
  public set facetType(type: FacetType) {
    this._facetType = type;
    this._facetTypeVisibleName = FacetTypes.getVisibleName(this._facetType);
    this.stateService.facetType.state = type;
  }
  public get subGroupType(): FacetType {
    return FacetTypes.other(this.facetType);
  }
  public get isAspect(): boolean {
    return this.facetType === FacetTypes.Aspect;
  }
  /**
   * Whether the size of displayed facet groups should depend on their mention count.
   */
  @Input()
  public scaleSize = true;
  @ViewChild('searchReference')
  public searchReference: SearchFilterComponent;

  constructor(
    public stateService: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public filterService: FilterService)
  { }

  ngOnInit() {
    // retrieve info from stateService
    const facetManager = this.stateService.facetType;
    this.facetType = facetManager.hasState ? facetManager.state : FacetTypes.Aspect;
    this._pageConfig = this.stateService.visPaginator;

    this.initialize();

    // set up url for detail page return.
    const urlSubscription = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });
    // set up auto update when new sorted values arrive
    const filterSubscription = this.filterService.filteredDataChange.subscribe(
      filtered => this.onFilter(filtered)
    );
    this.subscription.add(urlSubscription);
    this.subscription.add(filterSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Performs a full initialization.
   * Updates the model, and all related values.
   */
  public initialize() {
    const extractions = this.model.extractions;
    const groups = this.stateService.model.state.getGroupsFor(this.facetType);

    // calculate maximum mentions
    const type = this.stateService.facetType.state;
    this.maximumMentions = groups
      .map(g => g.extractions.length)
      .reduce((a, b) => Math.max(a, b), 0);
    const filter = this.filterService.getFilterById('minimum_mentions_slider');
    this.minimumMentions = filter !== null ? filter.value : 0;

    this.totalExtractionCount = extractions.length;
    this.filterService.data = groups;
    this.facetGroups = groups;
    this.sortedFacetGroups = this.facetGroups.slice();
    this.searchedFacetGroups = this.facetGroups.slice();
    this.groupCount = this.facetGroups.length;

    this.updateDisplayedFacetGroups();
  }

  public updatePaginator(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.groupCount = event.length;
    this.updateDisplayedFacetGroups();
  }

  private updateDisplayedFacetGroups() {
    // calculate indices to display
    const start = this.currentPageIndex * this.currentPageSize;
    const end = (this.currentPageIndex + 1) * this.currentPageSize;
    const toPieGroup = this.toPieGroup(this.totalExtractionCount);
    this.displayedFacetGroups = this.sortedFacetGroups
      .filter(value => this.searchedFacetGroups.findIndex((group) => group.id === value.id) !== -1)
      .slice(start, end)
      .map(toPieGroup);
  }

  private toPieGroup(scalingValue?: number) {
    // ignore scaling if scale size is false
    if (this.scaleSize) {
      return (group: ExtractionGroup) => PieExtractionGroup.fromGroup(group, scalingValue);
    } else {
      return PieExtractionGroup.fromGroup;
    }
  }

  public navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }

  public toggleTypes() {
    this.stateService.search.reset();
    this.facetType = FacetTypes.other(this.facetType);
    this.searchReference.clearSearch();
    this.initialize();
  }

  public onSort($event: PieExtractionGroup[]) {
    this.sortedFacetGroups = $event;
    this.updateDisplayedFacetGroups();
  }

  public onFilter(filtered: ExtractionGroup[]) {
    this.searchedFacetGroups = filtered;
    this.updatePaginator({ pageIndex: 0, pageSize: this.currentPageSize, length: this.searchedFacetGroups.length });
  }

  public onSortStateChange(state: SortState) {
    this.stateService.sort.state = state;
  }

  public onDrop($event: CdkDragDrop<ExtractionGroup>) {
    if (!$event.isPointerOverContainer) {
      return;
    }
    const mergee = $event.previousContainer.data;
    const receiver = $event.container.data;
    if (receiver.id === mergee.id) {
      console.warn('don\'t bite your own tail!');
      return;
    }
    console.log(`${receiver.name} gobbled up ${mergee.name}`);
    this.model.merge(receiver, mergee).map(this.toPieGroup(this.model.extractions.length));
    this.initialize();
    const snackRef = this.snackBar.open(`Merged '${mergee.name}' into '${receiver.name}'`, 'undo', { duration: 5000 });
    snackRef.onAction()
      .subscribe(() => {
        console.log(`disentangling ${mergee.name} from ${receiver.name}`);
        this.model.split(receiver, mergee);
        this.initialize();
      });
  }

  public onComparisonListDrop($event: CdkDragDrop<ExtractionGroup[]>) {
    const groups = $event.container.data.slice();
    const dragged = $event.item.data as ExtractionGroup;
    if (!groups.includes(dragged)) {
      groups.push(dragged);
      this.comparisonGroups = groups;
    }
  }

  public onFilterChange($event: FilterOption) {
    this.filterService.add($event);
  }

  public onFilterClear() {
    this.filterService.clearFilters();
  }

  public remove(group: ExtractionGroup) {
    const groups = this.comparisonGroups.slice();
    const i = groups.indexOf(group);
    groups.splice(i, 1);
    this.comparisonGroups = groups;
  }

  public log($event) {
    console.log($event);
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
