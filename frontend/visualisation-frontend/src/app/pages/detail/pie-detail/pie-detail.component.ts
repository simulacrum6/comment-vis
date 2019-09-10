import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Extraction, sentimentDifferential } from 'src/app/models/canonical';
import { StateService } from 'src/app/services/state.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';
import { mapToCompareSentimentStatement, mapToSentimentStatement, SentimentCount } from '../../../models/sentiment';

function getMoodPercentText(extractions: Extraction[]) {
  const sentimentCount = SentimentCount.fromExtractions(extractions);
  if (sentimentDifferential(extractions) <= - 0.5) {
    return Math.round((sentimentCount.negative / sentimentCount.total) * 100) + '% negative comments';
  } else {
    return Math.round((sentimentCount.positive / sentimentCount.total) * 100) + '% positive comments';
  }
}

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {
  private breadCrumbPaths: Observable<any>;

  private comments: Observable<string[]>;

  private sentimentDifferential: Observable<number>;
  private allExtractions: Observable<Extraction[]>;
  private overallSentimentDifferential: Observable<number>;
  private overallMood: Observable<string>;
  private overallMoodPercent: Observable<string>;
  private facetMood: Observable<string>;
  private facetMoodPercent: Observable<string>;
  private facetMoodEvaluation: Observable<string>;

  private history: History = history;
  private facetDifferential: Observable<number>;

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
    this.allExtractions = this.group$.pipe(
      map((_) => this.model.extractions)
    );
    this.comments = this.group$.pipe(
      map(group => this.model.getSubGroups(group, 'comment')),
      map(groups => groups.map(group => group.name))
    );
    this.overallSentimentDifferential = this.allExtractions.pipe(
      map(extractions => sentimentDifferential(extractions))
    );
    this.overallMood = this.overallSentimentDifferential.pipe(
      map(mapToSentimentStatement)
    );
    this.overallMoodPercent = this.allExtractions.pipe(
      map(getMoodPercentText)
    );
    this.facetDifferential = this.extractions$.pipe(
      map(extractions => sentimentDifferential(extractions)),
    );
    this.facetMood = this.facetDifferential.pipe(
      map(mapToSentimentStatement)
    );
    this.facetMoodPercent = this.extractions$.pipe(
      map(getMoodPercentText)
    );
    this.facetMoodEvaluation = combineLatest(this.overallMoodPercent, this.facetMoodPercent).pipe(
      map( ([overallPercent, facetPercent]) =>
        mapToCompareSentimentStatement(
          Number(overallPercent.substring(0, overallPercent.indexOf('%'))),
          Number(facetPercent.substring(0, facetPercent.indexOf('%')))
        ))
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
