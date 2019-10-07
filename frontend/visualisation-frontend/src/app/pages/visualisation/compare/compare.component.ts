import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { SortState } from 'src/app/components/controls/filters/sort-filter/sort';
import { Extraction, ExtractionGroup, FacetType, FacetTypes, ExtractionProperty, Model } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { StateService } from 'src/app/services/state.service';
import { SearchFilterComponent } from '../../../components/controls/filters/search-filter/search-filter.component';
import { PaginatorConfig } from 'src/app/models/utils';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { FilterService } from 'src/app/services/filter.service';
import { FilterGenerator } from 'src/app/services/filter';


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

  private facetGroups: ExtractionGroup[];
  private sortedFacetGroups: ExtractionGroup[];
  private searchedFacetGroups: ExtractionGroup[];
  private displayedFacetGroups: PieExtractionGroup[];
  private subscription = new Subscription();
  private totalExtractionCount: number;

  private _pageConfig: PaginatorConfig;
  private _facetType: FacetType;
  private _facetTypeVisibleName: string;

  private get breadCrumbPaths() {
    return [
      { name: 'Statistics', path: ['/stats'], queryParams: {} },
      { name: FacetTypes.getVisibleName(this.facetType) + 's', path: ['/vis/pie'], queryParams: {} }
    ];
  }
  private get pageSizes() {
    return this._pageConfig.pageSizes;
  }
  private set pageSizes(sizes) {
    this._pageConfig.pageSizes = sizes;
  }
  private get currentPageSize() {
    return this._pageConfig.pageSize;
  }
  private set currentPageSize(size) {
    this._pageConfig.pageSize = size;
  }
  private get currentPageIndex() {
    return this._pageConfig.pageIndex;
  }
  private set currentPageIndex(index) {
    this._pageConfig.pageIndex = index;
  }
  private get groupCount() {
    return this._pageConfig.length;
  }
  private set groupCount(length) {
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

  constructor(private stateService: StateService, private router: Router, private route: ActivatedRoute, private snackBar: MatSnackBar, private filterService: FilterService) {
  }

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
}
