import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StateService } from 'src/app/services/state.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {
  private breadCrumbPaths: Observable<any>;

  public comments: Observable<string[]>;
  public members: Observable<Set<string>>;

  get returnLink(): string[] {
    return this.stateService.lastPage.state.url;
  }

  get returnParams() {
    return this.stateService.lastPage.state.queryParams;
  }

  constructor(protected stateService: StateService) {
    super(stateService);
    stateService.lastPage.loadSafe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.comments = this.group$.pipe(
      map(group => this.model.getSubGroups(group, 'comment')),
      map(groups => groups.map(group => group.name))
    );
    this.members = combineLatest(this.extractions$, this.facetType$).pipe(
      map(([extractions, facetType]) => new Set(extractions.map(e => e[facetType].text)))
    );
    this.breadCrumbPaths = combineLatest(this.facet$, this.facetType$).pipe(
      map(([facet, facetType]) => [
        { name: 'Statistics', path: ['/stats'], queryParams: {}},
        { name: facetType + 's', path: ['/vis/pie'], queryParams: {}},
        { name: facet, path: ['/detail'], queryParams: { facet, facetType }}
      ])
    );
  }
}
