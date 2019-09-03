import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Extractions } from 'src/app/models/canonical';
import { StateService } from 'src/app/services/state.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {

  public comments$: Observable<string[]>;
  public members$: Observable<Set<string>>;

  private breadCrumbPaths$: Observable<any>;

  constructor(protected stateService: StateService) {
    super(stateService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.comments$ = this.extractions$.pipe(
      map(extractions => Object.keys(Extractions.groupBy(extractions, 'comment')))
    );
    this.members$ = combineLatest(this.extractions$, this.facetType$).pipe(
      map(([extractions, facetType]) => new Set(extractions.map(e => e[facetType].text)))
    );
    this.breadCrumbPaths$ = combineLatest(this.facet$, this.facetType$).pipe(
      map(([facet, facetType]) => [
        { name: 'Statistics', path: ['/stats'], queryParams: {}},
        { name: facetType + 's', path: ['/vis/pie'], queryParams: {}},
        { name: facet, path: ['/detail'], queryParams: { facet, facetType }}
      ])
    );
  }
}
