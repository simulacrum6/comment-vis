import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Extraction, ExtractionGroup, Extractions, FacetType, FacetTypes, StringMap } from 'src/app/models/canonical';
import { ModelService } from 'src/app/services/model.service';


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
        this.modelService.ensureModelIsAvailable();
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
