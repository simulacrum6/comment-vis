import { Component, OnInit, Input } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, FacetType } from 'src/app/models/canonical';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'app-pie-grid',
  templateUrl: './pie-grid.component.html',
  styleUrls: ['./pie-grid.component.scss']
})
export class PieGridComponent implements OnInit {

  @Input() facetType: FacetType = 'aspect';
  @Input() scaleSize = true;

  // TODO: add type to model
  private facetGroups: { name: string, extractions: Extraction[], sizeRatio: number }[];
  private selectedFacetGroups: { name: string, extractions: Extraction[], sizeRatio: number }[];
  private subGroupType: FacetType = 'attribute';

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/overview'], queryParams: {} },
    { name: this.facetType + 's', path: ['/vis/pie'], queryParams: {} }
  ];

  private pageSizes = [25, 35, 50, 75, 150];
  private currentPageSize = this.pageSizes[1];
  private currentPageIndex = 0;

  private sortBy = 'positive';
  public mappingFunction = (x) => x.extractions;

  constructor(private modelService: ModelService, private router: Router) { }

  ngOnInit() {
    this.update();
  }

  public update() {
    const extractions = this.modelService.model.rawExtractions;
    const facetMap = Extractions.groupBy(extractions, this.facetType);
    this.facetGroups = Object.entries(facetMap)
      .map(([groupName, groupExtractions]) => ({
        name: groupName,
        extractions: groupExtractions,
        sizeRatio: this.scaleSize ? groupExtractions.length / extractions.length : 0.25
      }));

    this.updateSelectedFacetGroups();
  }

  public updatePage(event: PageEvent) {
    this.currentPageIndex = event.pageIndex;
    this.currentPageSize = event.pageSize;
    this.updateSelectedFacetGroups();
  }

  private updateSelectedFacetGroups() {
    const start = this.currentPageIndex * this.currentPageSize;
    const end = (this.currentPageIndex + 1) * this.currentPageSize;
    this.selectedFacetGroups = this.facetGroups.slice(start, end);
  }

  public navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }

  public toggleTypes() {
    const old = this.facetType;
    this.facetType = this.subGroupType;
    this.subGroupType = old;
    this.breadCrumbPaths[this.breadCrumbPaths.length - 1].name = this.facetType + 's';
    this.update();
  }

  private log($event: any) {
    console.log($event);
  }
}
