import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { histogram } from 'datalib';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Extraction, Extractions, FacetType, sentimentDifferential } from 'src/app/models/canonical';
import { mapToSentiment, mapToSentimentStatement, SentimentCount, Sentiments } from 'src/app/models/sentiment';
import { valueCounts } from 'src/app/models/utils';
import { FilterGenerator } from 'src/app/services/filter';
import { FilterService } from 'src/app/services/filter.service';
import { StateService } from 'src/app/services/state.service';
import { DefaultColorStrings } from 'src/environments/constants';

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {

  private subscription = new Subscription();

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/stats']}
  ];

  private extractions: Extraction[];
  private values: { attribute: string[], aspect: string[], comment: string[], sentiment: string[]};
  private uniqueValues: { attribute: Set<string>, aspect: Set<string>, comment: Set<string>, sentiment: Set<string> };
  private sentimentCounts: SentimentCount;
  private valueCounts;
  private mood: string;
  private moodPercent: string;
  private warnings: string[] = [];
  private sentimentDistributionData: ChartDataSets[] = [];
  private sentimentDistributionType: ChartType = 'bar';
  private sentimentDistributionLabels: Label[] = ['positive', 'negative', 'neutral', 'unknown'];
  private sentimentDistributionOptions: ChartOptions = {
    legend: {
      display: false
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }],
    }
  };
  private sentimentDistributionColors;

  private facetDistributionType: ChartType = 'bar';
  private facetDistributionOptions: ChartOptions = {
    legend: {
      display: false
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Number of Comments mentioning a Topic'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Number of Topics'
        },
        ticks: {
          beginAtZero: true
        }
      }],
    }
  };
  private facetRankingOptions: ChartOptions = {
    legend: {
      display: false
    },
    tooltips: {
      mode: 'index',
      intersect: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }],
    }
  };
  private maxRankingDisplayItems = 10;

  private aspectRankingData: ChartDataSets[] = [];
  private aspectRankingLabels: Label[] = [];
  private attributeRankingData: ChartDataSets[] = [];
  private attributeRankingLabels: Label[] = [];
  private aspectDistributionData: ChartDataSets[] = [];
  private aspectDistributionLabels: Label[] = [];

  get tooManyAspects(): boolean {
    return this.valueCounts.aspect.length > this.maxRankingDisplayItems;
  }
  get tooManyAttributes(): boolean {
    return this.valueCounts.attribute.length > this.maxRankingDisplayItems;
  }

  constructor(private stateService: StateService, private router: Router, private route: ActivatedRoute, private filterService: FilterService) {
    this.stateService.loadSafe();
    this.extractions = stateService.model.state.extractions;
    this.values = {
      attribute: Extractions.values(this.extractions, 'attribute'),
      aspect: Extractions.values(this.extractions, 'aspect'),
      comment: Extractions.values(this.extractions, 'comment'),
      sentiment: Extractions.values(this.extractions, 'sentiment')
    };
    this.uniqueValues = {
      attribute: new Set(this.values.attribute),
      aspect: new Set(this.values.aspect),
      comment: new Set(this.values.comment),
      sentiment: new Set(this.values.sentiment)
    };
    this.sentimentCounts = SentimentCount.fromArray(this.values.sentiment.map(mapToSentiment));
    this.valueCounts = {
      attribute: valueCounts(this.values.attribute, 'descending'),
      aspect: valueCounts(this.values.aspect, 'descending'),
      comment: valueCounts(this.values.comment, 'descending'),
      sentiment: valueCounts(this.values.sentiment, 'descending')
    };

    /** Mood **/
    // TODO: Make computed values visible in warnings
    const sentimentDiff = sentimentDifferential(this.extractions);
    this.mood = mapToSentimentStatement(sentimentDiff);

    if (sentimentDiff <= - 0.5) {
      this.moodPercent = Math.round((this.sentimentCounts.negative / this.sentimentCounts.total) * 100) + '% negative comments';
    } else {
      this.moodPercent = Math.round((this.sentimentCounts.positive / this.sentimentCounts.total) * 100) + '% positive comments';
    }

    /** Warnings **/
    if (this.uniqueValues.comment.size < 30) {
      this.warnings.push(`This dataset contains only ${this.uniqueValues.comment.size} comments - ` +
        `some visualisations could be misleading. You should consider adding more data`);
    }
    if (this.sentimentCounts.unknown > 0) {
      this.warnings.push(
        `Your uploaded dataset contains ${this.sentimentCounts.unknown} comments with unknown sentiment - ` +
        `These comments will not be shown in most visualisations.`
      );
    }

    /** Sentiment Distribution **/
    const sentimentData: any = {};
    sentimentData.data = [this.sentimentCounts.positive, this.sentimentCounts.negative,
      this.sentimentCounts.neutral, this.sentimentCounts.unknown];
    this.sentimentDistributionColors = [{
      backgroundColor: Sentiments.map(sentiment => DefaultColorStrings.backgroundColor[sentiment]),
      borderColor: Sentiments.map(sentiment => DefaultColorStrings.borderColor[sentiment]),
      hoverBackgroundColor: Sentiments.map(sentiment => DefaultColorStrings.hoverBackgroundColor[sentiment])
    }];
    this.sentimentDistributionData.push(sentimentData);

    /** Aspect Ranking **/
    const aspectRankingData: any = {};
    const aspectRankingCounts = [];
    this.valueCounts.aspect
    .slice(0, this.maxRankingDisplayItems)
    .forEach(aspect => {
      aspectRankingCounts.push(aspect.count);
      this.aspectRankingLabels.push(aspect.value);
    });
    aspectRankingData.data = aspectRankingCounts;
    this.aspectRankingData.push(aspectRankingData);

    /** Aspect Distribution **/
    const counts = this.valueCounts.aspect.map(aspect => aspect.count);
    const hist = histogram(counts);
    this.aspectDistributionData = [
      { label: 'Topics in Category', data: hist.map(entry => entry.count) },
    ];
    this.aspectDistributionLabels = hist.map(entry => entry.value);

    /** Attribute Ranking **/
    const attributeData: any = {};
    const attributeCounts = [];
    this.valueCounts.attribute.slice(0, this.maxRankingDisplayItems).forEach(attribute => {
      attributeCounts.push(attribute.count);
      this.attributeRankingLabels.push(attribute.value);
    });
    attributeData.data = aspectRankingCounts;
    this.attributeRankingData.push(attributeData);
  }

  public handleRankingClick(event: any, facetType: FacetType) {
    if (event.active.length > 0) {
      const chart = event.active[0]._chart;
      const activePoints = chart.getElementAtEvent(event.event);
      if (activePoints.length > 0) {
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex];
        this.navigateToDetailPage(label, facetType);
      }
    }
  }

  private navigateToDetailPage(facet: string, facetType: FacetType) {
    this.router.navigate(['/detail'], { queryParams: { facet, facetType } });
  }

  ngOnInit() {
    const urlSubscription = this.route.url.subscribe(
      url => {
        const path = ['/' + url.join('/')];
        const state = this.stateService.lastPage.state;
        this.stateService.lastPage.state = {...state, url: path };
      }
    );
    const paramSubScription = this.route.params.subscribe(
      params => {
        const state = this.stateService.lastPage.state;
        this.stateService.lastPage.state = {...state, queryParams: params };
      }
    );
    this.subscription.add(urlSubscription);
    this.subscription.add(paramSubScription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
