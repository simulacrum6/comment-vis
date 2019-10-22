import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { histogram } from 'datalib';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { Extraction, Extractions, FacetType, sentimentDifferential } from 'src/app/models/canonical';
import { mapToSentiment, mapToSentimentStatement, Sentiment, SentimentCount } from 'src/app/models/sentiment';
import { valueCounts } from 'src/app/models/utils';
import { FilterService } from 'src/app/services/filter.service';
import { StateService } from 'src/app/services/state.service';
import { DefaultColorStrings } from 'src/environments/constants';
import { FacetTypes } from '../../models/canonical';

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss']
})
export class StatisticsComponent implements OnInit, OnDestroy {

  public print = false;
  private subscription = new Subscription();

  public extremaFacetType: FacetType = FacetTypes.Aspect;

  public get isExtremaAspect(): boolean {
    return this.extremaFacetType === FacetTypes.Aspect;
  }

  public extremaSentiment: Sentiment = Sentiment.Positive;

  public get isExtremaPositive(): boolean {
    return this.extremaSentiment === Sentiment.Positive;
  }

  public breadCrumbPaths = [
    { name: 'Upload', path: ['/']},
    { name: 'Statistics', path: ['/stats']}
  ];

  public extractions: Extraction[];
  public values: { attribute: string[], aspect: string[], comment: string[], sentiment: string[]};
  public uniqueValues: { attribute: Set<string>, aspect: Set<string>, comment: Set<string>, sentiment: Set<string> };
  public sentimentCounts: SentimentCount;
  public valueCounts;
  public mood: string;
  public moodPercent: string;
  public warnings: string[] = [];
  public sentimentDistributionData: number[] = [];
  public sentimentDistributionType: ChartType = 'pie';
  public sentimentDistributionLabels: Label[] = [];
  public sentimentDistributionOptions: any = {
    animation: { animateRotate: true, animateScale: true },
    responsive: false,
    aspectRatio: 1,
    legend: { display: false },
    tooltips: { enabled: true}
  };
  public sentimentDistributionColors = [];

  public sentimentExtremaData: ChartDataSets[] = [];
  public sentimentExtremaType: ChartType = 'bar';
  public sentimentExtremaOptions: ChartOptions = {
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
  public sentimentExtremaLabels: Label[] = [];

  public facetDistributionType: ChartType = 'bar';
  public facetDistributionOptions: ChartOptions = {
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
          labelString: 'Number of Topics'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Number of Comments'
        },
        ticks: {
          beginAtZero: true
        }
      }],
    }
  };
  public facetRankingOptions: ChartOptions = {
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
    },
    hover: {
      onHover: (event: any, chartElement) => {
        event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
      }
    }
  };
  public maxRankingDisplayItems = 10;

  public aspectRankingData: ChartDataSets[] = [];
  public aspectRankingLabels: Label[] = [];
  public attributeRankingData: ChartDataSets[] = [];
  public attributeRankingLabels: Label[] = [];
  public aspectDistributionData: ChartDataSets[] = [];
  public aspectDistributionLabels: Label[] = [];

  get tooManyAspects(): boolean {
    return this.valueCounts.aspect.length > this.maxRankingDisplayItems;
  }
  get tooManyAttributes(): boolean {
    return this.valueCounts.attribute.length > this.maxRankingDisplayItems;
  }

  constructor(
    private stateService: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private filterService: FilterService) {
    this.stateService.loadSafe();
    this.stateService.model.state.updateExtractions();
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
        `These comments will not be considered in most visualisations.`
      );
    }

    /** Sentiment Distribution **/
    this.sentimentDistributionData = [];
    const availableSentiments = [];

    if (this.sentimentCounts.positive > 0) {
      this.sentimentDistributionData.push(this.sentimentCounts.positive);
      this.sentimentDistributionLabels.push('positive');
      availableSentiments.push(Sentiment.Positive);
    }
    if (this.sentimentCounts.neutral > 0) {
      this.sentimentDistributionData.push(this.sentimentCounts.neutral);
      this.sentimentDistributionLabels.push('neutral');
      availableSentiments.push(Sentiment.Neutral);
    }

    if (this.sentimentCounts.negative > 0) {
      this.sentimentDistributionData.push(this.sentimentCounts.negative);
      this.sentimentDistributionLabels.push('negative');
      availableSentiments.push(Sentiment.Negative);
    }

    if (this.sentimentCounts.unknown > 0) {
      this.sentimentDistributionData.push(this.sentimentCounts.unknown);
      this.sentimentDistributionLabels.push('unknown');
      availableSentiments.push(Sentiment.Unknown);
    }

    this.sentimentDistributionColors = [{
      backgroundColor: availableSentiments.map(sentiment => DefaultColorStrings.backgroundColor[sentiment]),
      borderColor: availableSentiments.map(sentiment => DefaultColorStrings.borderColor[sentiment]),
      hoverBackgroundColor: availableSentiments.map(sentiment => DefaultColorStrings.hoverBackgroundColor[sentiment])
    }];

    this.initializeExtremaBarChart();

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
    this.aspectDistributionLabels = [];

    for (let i = 0; i < hist.length; i++) {
      if (hist.length <= i + 1) {
        this.aspectDistributionLabels.push(hist[i].value + '+');
      } else {
        this.aspectDistributionLabels.push(hist[i].value + '-' + hist[i + 1].value);
      }
    }

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

  private initializeExtremaBarChart() {
    this.sentimentExtremaData = [];
    this.sentimentExtremaLabels = [];

    const extremaData: any = {};
    extremaData.data = [];
    const aspectMap = Object.entries(Extractions.groupBy(this.extractions, this.extremaFacetType));
    aspectMap.sort((a, b) => {
      if (this.extremaSentiment === Sentiment.Negative) {
        return SentimentCount.fromExtractions(b[1]).negative - SentimentCount.fromExtractions(a[1]).negative;
      }
      return SentimentCount.fromExtractions(b[1]).positive - SentimentCount.fromExtractions(a[1]).positive;
    });

    aspectMap.slice(0, 10)
      .forEach(entry => {
        if (this.extremaSentiment === Sentiment.Negative) {
          extremaData.data.push(SentimentCount.fromExtractions(entry[1]).negative);
        } else {
          extremaData.data.push(SentimentCount.fromExtractions(entry[1]).positive);
        }
        this.sentimentExtremaLabels.push(entry[0]);
      });

    this.sentimentExtremaData.push(extremaData);
  }

  public exportModel() {
    const serialized = this.stateService.model.model.exportAsJSONString();
    const download = document.createElement('a');
    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(serialized)),
      download.setAttribute('download', `${this.stateService.model.modelId}.export.ce.json`);
    download.click();

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

  public toggleExtremaFacetType() {
    this.extremaFacetType = FacetTypes.other(this.extremaFacetType);
    this.initializeExtremaBarChart();
  }

  public toggleExtremaSentiment() {
    this.extremaSentiment = this.extremaSentiment === Sentiment.Positive ? Sentiment.Negative : Sentiment.Positive;
    this.initializeExtremaBarChart();
  }

  public printPage() {
    this.print = true;
    setTimeout(() => {
      window.print();
      this.print = false;
    }, 66)
  }
}
