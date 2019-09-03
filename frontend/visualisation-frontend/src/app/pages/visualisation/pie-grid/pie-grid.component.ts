import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { Extraction, ExtractionGroup, FacetType } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { StateService } from 'src/app/services/state.service';
import { SearchFilterComponent } from '../../../components/filters/search-filter/search-filter.component';

interface PieExtractionGroup extends ExtractionGroup {
  sizeRatio: number;
}

@Component({
  selector: 'app-pie-grid',
  templateUrl: './pie-grid.component.html',
  styleUrls: ['./pie-grid.component.scss']
})
export class PieGridComponent implements OnInit {

  @Input() facetType: FacetType = 'aspect';
  @Input() scaleSize = true;

  // TODO: add type to model
  private facetGroups: PieExtractionGroup[];
  private sortedFacetGroups: PieExtractionGroup[];
  private searchedFacetGroups: PieExtractionGroup[];
  private selectedFacetGroups: PieExtractionGroup[];
  private subGroupType: FacetType = 'attribute';

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/stats'], queryParams: {} },
    { name: this.facetType + 's', path: ['/vis/pie'], queryParams: {} }
  ];

  private pageSizes = [25, 35, 50, 75, 150];
  private currentPageSize = this.pageSizes[1];
  private currentPageIndex = 0;
  private currentLength;

  // temporary properties for filter
  private sortBy = 'positive';

  @ViewChild('searchReference') searchReference: SearchFilterComponent;

  constructor(private stateService: StateService, private router: Router) { }

  ngOnInit() {
    this.update();
  }

  public update() {
    const extractions = this.stateService.model.extractions;
    this.facetGroups = this.stateService.model.getGroupList(this.facetType)
      .map(group => ({
        ...group,
        sizeRatio: this.scaleSize ? group.extractions.length / extractions.length : 0.25
      }));
    this.sortedFacetGroups = this.facetGroups.slice();
    this.searchedFacetGroups = this.facetGroups.slice();
    this.currentLength = this.facetGroups.length;

    this.updateSelectedFacetGroups();
  }

  public updatePage(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.currentLength = event.length;
    this.updateSelectedFacetGroups();
  }

  private updateSelectedFacetGroups() {
    const start = this.currentPageIndex * this.currentPageSize;
    const end = (this.currentPageIndex + 1) * this.currentPageSize;
    this.selectedFacetGroups = this.sortedFacetGroups.filter(value => this.searchedFacetGroups.indexOf(value) !== -1).slice(start, end);
  }

  public navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }

  public toggleTypes() {
    const old = this.facetType;
    this.facetType = this.subGroupType;
    this.subGroupType = old;
    this.breadCrumbPaths[this.breadCrumbPaths.length - 1].name = this.facetType + 's';
    this.searchReference.clearSearch();
    this.update();
  }

  public onSort($event: { name: string, extractions: Extraction[], sentimentCount: SentimentCount, sizeRatio: number }[]) {
    this.sortedFacetGroups = $event;
    this.updateSelectedFacetGroups();
  }

  public onSearch($event: { name: string, extractions: Extraction[], sentimentCount: SentimentCount, sizeRatio: number }[]) {
    this.searchedFacetGroups = $event;
    this.updatePage({ pageIndex: 0, pageSize: this.currentPageSize, length: this.searchedFacetGroups.length });
  }
}
