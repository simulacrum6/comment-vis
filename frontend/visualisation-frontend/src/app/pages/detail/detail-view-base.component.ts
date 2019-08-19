import { Component, OnInit, Input } from '@angular/core';
import { Extraction, StringMap, Extractions, FacetType, FacetTypes, Model } from 'src/app/models/canonical';
import { ModelService } from 'src/app/services/model.service';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({

})
export class DetailViewBaseComponent implements OnInit {
    @Input() facet$: Observable<string>; // TODO: remove after testing
    @Input() facetType$: Observable<FacetType>;

    protected extractions$: Observable<Extraction[]>;
    protected subGroups$: Observable<StringMap<Extraction[]>>;
    protected subGroupType$: Observable<FacetType> ;
    protected facetExists$: Observable<boolean> = new BehaviorSubject(true);

    constructor(protected modelService: ModelService) {
        // TODO: remove after testing.
        if (!modelService.model) {
         this.modelService.generateModelFromJson(foursquare);
        }
    }

    ngOnInit() {
        this.subGroupType$ = this.facetType$.pipe(
            map(FacetTypes.other)
        );
        this.extractions$ = combineLatest(this.facet$, this.facetType$).pipe(
            map(([facet, facetType]) => this.modelService.model.getGroup(facet, facetType).extractions)
        );

        this.facetExists$ = this.extractions$.pipe(
            map(extractions => extractions.length !== 0)
        );

        this.subGroups$ = combineLatest(this.extractions$, this.subGroupType$, this.facetExists$).pipe(
            map(([extractions, subGroupType, facetExists]) => {
                if (facetExists) {
                    return Extractions.groupBy(extractions, subGroupType);
                } else {
                    return null;
                }
            })
        );
    }

}
