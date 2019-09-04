import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SortState } from 'src/app/components/filters/sort-filter/sort';
import { Extraction, ExtractionGroup, FacetType, FacetTypes } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { StateService } from 'src/app/services/state.service';
import { SearchFilterComponent } from '../../../components/filters/search-filter/search-filter.component';
import { PaginatorConfig } from 'src/app/models/utils';


class PieExtractionGroup extends ExtractionGroup {
  public sizeRatio: number = 0.25;

  constructor(name: string, extractions: Extraction[], sentimentCount?: SentimentCount) {
    super(name, extractions, sentimentCount);
  }

  static fromGroup(group: ExtractionGroup, scalingValue?: number): PieExtractionGroup {
    const pieGroup = new PieExtractionGroup(group.name, group.extractions, group.sentimentCount);
    if (scalingValue) {
      pieGroup.sizeRatio = pieGroup.extractions.length / scalingValue;
    }
    return pieGroup;
  }
}

@Component({
  selector: 'app-pie-grid',
  templateUrl: './pie-grid.component.html',
  styleUrls: ['./pie-grid.component.scss']
})
export class PieGridComponent implements OnInit, OnDestroy {

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/stats'], queryParams: {} },
    { name: this.facetType + 's', path: ['/vis/pie'], queryParams: {} }
  ];


  private facetGroups: PieExtractionGroup[];
  private sortedFacetGroups: PieExtractionGroup[];
  private searchedFacetGroups: PieExtractionGroup[];
  private displayedFacetGroups: PieExtractionGroup[];

  private subscription = new Subscription();

  private _pageConfig: PaginatorConfig;
  private _facetType: FacetType;

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
  private get currentLength() {
    return this._pageConfig.length;
  }
  private set currentLength(length) {
    this._pageConfig.length = length;
  }

  get pageConfig() {
    return this._pageConfig;
  }

  get facetType(): FacetType {
    return this._facetType;
  }
  @Input()
  set facetType(type: FacetType) {
    this._facetType = type;
    this.stateService.facetType.state = type;
  }

  get subGroupType(): FacetType {
    return FacetTypes.other(this.facetType);
  }

  get isAspect(): boolean {
    return this.facetType === FacetTypes.Aspect;
  }

  @Input() scaleSize = true;

  @ViewChild('searchReference') searchReference: SearchFilterComponent;

  constructor(private stateService: StateService, private router: Router, private route: ActivatedRoute) {
    const facetManager = this.stateService.facetType;
    this.facetType = facetManager.hasState ? facetManager.state : FacetTypes.Aspect;
    console.log(this.stateService.visPaginator.read())
    console.log(this.stateService.visPaginator.state)
    this._pageConfig = this.stateService.visPaginator;
  }

  ngOnInit() {
    this.update();
    const urlSubscription = this.route.url.subscribe(
      url => {
        const path = ['/vis/' + url.join('/')];
        const state = this.stateService.lastPage.state;
        this.stateService.lastPage.state = {...state, url: path };
      }
    );
    const paramSubScription = this.route.params.subscribe(
      params => {
        const state = this.stateService.lastPage.state;
        this.stateService.lastPage.state = {...state, queryParams: params };
      }
    );
    this.subscription.add(urlSubscription);
    this.subscription.add(paramSubScription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public update() {
    const model = this.stateService.model.state;
    const extractions = model.extractions;
    this.facetGroups = this.stateService.model.state.getGroupList(this.facetType)
      .map(this.toPieGroup(extractions.length));
    this.sortedFacetGroups = this.facetGroups.slice();
    this.searchedFacetGroups = this.facetGroups.slice();
    this.currentLength = this.facetGroups.length;

    this.updateDisplayedFacetGroups();
  }

  private toPieGroup(scalingValue?: number) {
    if (this.scaleSize) {
      return (group: ExtractionGroup) => PieExtractionGroup.fromGroup(group, scalingValue);
    } else {
      return PieExtractionGroup.fromGroup;
    }
  }

  public updatePage(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.currentLength = event.length;
    this.updateDisplayedFacetGroups();
  }

  private updateDisplayedFacetGroups() {
    const start = this.currentPageIndex * this.currentPageSize;
    const end = (this.currentPageIndex + 1) * this.currentPageSize;
    this.displayedFacetGroups = this.sortedFacetGroups.filter(value => this.searchedFacetGroups.indexOf(value) !== -1).slice(start, end);
  }

  public navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }

  public toggleTypes() {
    this.stateService.search.reset();
    this.facetType = FacetTypes.other(this.facetType);
    this.breadCrumbPaths[this.breadCrumbPaths.length - 1].name = this.facetType + 's';
    this.searchReference.clearSearch();
    this.update();
  }

  public onSort($event: { name: string, extractions: Extraction[], sentimentCount: SentimentCount, sizeRatio: number }[]) {
    this.sortedFacetGroups = $event;
    this.updateDisplayedFacetGroups();
  }

  public onSearch($event: { name: string, extractions: Extraction[], sentimentCount: SentimentCount, sizeRatio: number }[]) {
    this.searchedFacetGroups = $event;
    this.updatePage({ pageIndex: 0, pageSize: this.currentPageSize, length: this.searchedFacetGroups.length });
  }

  public onSortStateChange(state: SortState) {
    this.stateService.sort.state = state;
  }
}
