import { Component, OnInit, Input } from '@angular/core';
import { Extraction, StringMap, Extractions, FacetType, FacetTypes, Model, ExtractionGroup } from 'src/app/models/canonical';
import { ModelService } from 'src/app/services/model.service';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({

})
export class DetailViewBaseComponent implements OnInit {
    protected extractions$: Observable<Extraction[]>;
    protected facetExists$: Observable<boolean> = new BehaviorSubject(true);
    protected group$: Observable<ExtractionGroup>;
    protected subGroups$: Observable<StringMap<Extraction[]>>;
    protected subGroupType$: Observable<FacetType> ;

    @Input() facet$: Observable<string>;
    @Input() facetType$: Observable<FacetType>;

    constructor(protected modelService: ModelService) {
        // TODO: remove after testing.
        if (!modelService.model) {
         this.modelService.generateModelFromJson(foursquare);
        }
    }

    ngOnInit() {
        this.group$ = combineLatest(this.facet$, this.facetType$).pipe(
            map(facetDescription => this.modelService.model.getGroup(...facetDescription))
        );
        this.extractions$ = this.group$.pipe(
            map(group => group.extractions)
        );
        this.facetExists$ = this.extractions$.pipe(
            map(extractions => extractions.length !== 0)
        );
        this.subGroupType$ = this.facetType$.pipe(
            map(FacetTypes.other)
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
