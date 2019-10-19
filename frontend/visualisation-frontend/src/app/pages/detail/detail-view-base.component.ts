import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Extraction, ExtractionGroup, Extractions, FacetType, FacetTypes, StringMap, Model, ViewExtractionGroup } from 'src/app/models/canonical';
import { StateService } from 'src/app/services/state.service';


@Component({

})
export class DetailViewBaseComponent implements OnInit {
    protected extractions$: Observable<Extraction[]>;
    protected facetExists$: Observable<boolean> = new BehaviorSubject(true);
    protected group$: Observable<ExtractionGroup>;
    protected subGroups$: Observable<ExtractionGroup[]>;
    protected subGroupType$: Observable<FacetType>;
    protected faceTypeVisibleName$: Observable<string>;
    protected updateEvent$: BehaviorSubject<void>;

    protected get model(): Model{
        return this.stateService.model.state;
    }

    @Input() facet$: Observable<string>;
    @Input() facetType$: BehaviorSubject<FacetType>;

    constructor(protected stateService: StateService) {
        this.stateService.loadSafe();
    }

    ngOnInit() {
        this.updateEvent$ = new BehaviorSubject(null);
        this.group$ = combineLatest(this.facet$, this.facetType$, this.updateEvent$).pipe(
            map(facetDescription => this.model.getGroupByName(facetDescription[0], facetDescription[1])),
            tap(group => console.log(group))
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
        this.subGroups$ = combineLatest(this.group$, this.subGroupType$).pipe(
            map(([group, type]) => this.model.getSubGroups(group, type)),
            tap(groups => console.log(groups)),
        );
        this.faceTypeVisibleName$ = this.facetType$.pipe(
          map(type => FacetTypes.getVisibleName(type).toLowerCase())
        );
    }

}
