import { Component, OnInit, Input } from '@angular/core';
import { Extraction, StringMap, Extractions } from 'src/app/models/canonical';
import { ModelService } from 'src/app/services/model.service';
import { default as data } from 'src/app/models/foursquare_gold.ce.json';

@Component({

})
export class DetailViewBaseComponent implements OnInit {
    @Input() facet: string; // TODO: remove after testing
    @Input() facetType: 'aspect' | 'attribute' = 'aspect';

    protected extractions: Extraction[];
    protected subGroups: StringMap<Extraction[]>;
    protected subGroupType: 'aspect' | 'attribute' = 'attribute';
    protected facetExists = true;

    constructor(protected modelService: ModelService) {
        // TODO: remove after testing.
        if (!modelService.model) {
        this.modelService.generateModelFromJson(data);
        }
    }

    ngOnInit() {
        this.subGroupType = this.facetType === 'aspect' ? 'attribute' : 'aspect';
        this.extractions = Extractions.groupBy(this.modelService.model.rawExtractions, this.facetType)[this.facet];
        // abort if no extractions are available
        if (this.extractions === undefined) {
          this.facetExists = false;
          return;
        }
        this.subGroups = Extractions.groupBy(this.extractions, this.subGroupType);
    }

}
