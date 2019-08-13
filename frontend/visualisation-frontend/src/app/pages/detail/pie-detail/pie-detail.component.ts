import { Component, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';
import { Extractions } from 'src/app/models/canonical';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {

  public comments$: Observable<string[]>;
  public members$: Observable<Set<string>>;

  constructor(protected modelService: ModelService) {
    super(modelService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.comments$ = this.extractions$.pipe(
      map(extractions => Object.keys(Extractions.groupBy(extractions, 'comment')))
    );
    this.members$ = combineLatest(this.extractions$, this.facetType$).pipe(
      map(([extractions, facetType]) => new Set(extractions.map(e => e[facetType].text)))
    );
  }
}
