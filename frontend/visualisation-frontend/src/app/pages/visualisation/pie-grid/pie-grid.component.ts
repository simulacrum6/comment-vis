import { Component, OnInit, Input } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, FacetType } from 'src/app/models/canonical';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pie-grid',
  templateUrl: './pie-grid.component.html',
  styleUrls: ['./pie-grid.component.scss']
})
export class PieGridComponent implements OnInit {

  @Input() facetType: 'aspect' | 'attribute' = 'aspect';
  @Input() scaleSize = false;

  // TODO: add type to model
  private facetGroups: { name: string, extractions: Extraction[], sizeRatio: number }[];

  constructor(private modelService: ModelService, private router: Router) { }

  ngOnInit() {
    const extractions = this.modelService.model.rawExtractions;
    const facetMap = Extractions.groupBy(extractions, this.facetType);
    this.facetGroups = Object.entries(facetMap)
      .map(([groupName, groupExtractions]) => ({
        name: groupName,
        extractions: groupExtractions,
        sizeRatio: this.scaleSize ? groupExtractions.length / extractions.length : 0.25
      }));
  }

  public navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }
}
