import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { SortState } from 'src/app/components/filters/sort-filter/sort';
import { Extraction, ExtractionGroup, FacetType, FacetTypes } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { StateService } from 'src/app/services/state.service';
import { SearchFilterComponent } from '../../../components/filters/search-filter/search-filter.component';


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
export class PieGridComponent implements OnInit {

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/stats'], queryParams: {} },
    { name: this.facetType + 's', path: ['/vis/pie'], queryParams: {} }
  ];

  private pageSizes = [25, 35, 50, 75, 150];
  private currentPageSize = this.pageSizes[1];
  private currentPageIndex = 0;
  private currentLength;

  private facetGroups: PieExtractionGroup[];
  private sortedFacetGroups: PieExtractionGroup[];
  private searchedFacetGroups: PieExtractionGroup[];
  private displayedFacetGroups: PieExtractionGroup[];

  private _facetType: FacetType;

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

  constructor(private stateService: StateService, private router: Router) {
    const facetManager = this.stateService.facetType;
    this.facetType = facetManager.hasState ? facetManager.state : FacetTypes.Aspect;
  }

  ngOnInit() {
    this.update();
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
