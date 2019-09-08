import { Component, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Extraction, sentimentDifferential } from 'src/app/models/canonical';
import { StateService } from 'src/app/services/state.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';
import { mapToCompareSentimentStatement, mapToSentimentStatement, SentimentCount } from '../../../models/sentiment';

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {
  private breadCrumbPaths: Observable<any>;

  public comments: Observable<string[]>;
  public members: Observable<Set<string>>;

  private overallMood: Observable<string>;
  private overallMoodPercent: Observable<string>;
  private facetMood: Observable<string>;
  private facetMoodPercent: Observable<string>;
  private facetMoodEvaluation: Observable<string>;

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
    this.overallMood = this.group$.pipe(
      map(() => this.model.extractions),
      map(extractions => sentimentDifferential(extractions)),
      map(differential => mapToSentimentStatement(differential))
    );
    this.overallMoodPercent = this.group$.pipe(
      map(() => this.model.extractions),
      map(extractions => new MoodWrapper(extractions)),
      map(wrappedMood => wrappedMood.getMoodPercentText())
    );

    this.facetMood = this.extractions$.pipe(
      map(extractions => sentimentDifferential(extractions)),
      map(differential => mapToSentimentStatement(differential))
    );

    this.facetMoodPercent = this.extractions$.pipe(
      map(extractions => new MoodWrapper(extractions)),
      map(wrappedMood => wrappedMood.getMoodPercentText())
    );
    this.facetMoodEvaluation = combineLatest(this.overallMoodPercent, this.facetMoodPercent).pipe(
      map( ([overallPercent, facetPercent]) =>
        mapToCompareSentimentStatement(Number(overallPercent.substring(0, overallPercent.indexOf('%'))),
          Number(facetPercent.substring(0, facetPercent.indexOf('%')))))
    );
  }
}

/**
 * Couldn't find out how to work with two values in rxjs, so I had to introduce a wrapper class to hold the values
 */
class MoodWrapper {
  private sentimentDifferential: number;
  private sentimentCount: SentimentCount;

  constructor(extractions: Extraction[]) {
    this.sentimentDifferential = sentimentDifferential(extractions);
    this.sentimentCount = SentimentCount.fromExtractions(extractions);
  }

  public getMoodPercentText() {
    if (this.sentimentDifferential <= - 0.5) {
      return Math.round((this.sentimentCount.negative / this.sentimentCount.total) * 100) + '% negative comments';
    } else {
      return Math.round((this.sentimentCount.positive / this.sentimentCount.total) * 100) + '% positive comments';
    }
  }
}
