import {Component, OnInit} from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions } from 'src/app/models/canonical';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import {SentimentCount, mapToSentiment, mapToSentimentStatement} from 'src/app/models/sentiment';
import { valueCounts } from 'src/app/models/utils';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { sentimentDifferential } from 'src/app/models/canonical';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import {Sentiments} from '../../models/sentiment';
import {DefaultColorStrings} from '../../../environments/constants';
import {FacetType} from '../../models/canonical';

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './dataset-overview.component.html',
  styleUrls: ['./dataset-overview.component.scss']
})
export class DatasetOverviewComponent implements OnInit {

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/overview']}
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

  constructor(private modelService: ModelService, private router: Router, private snackBar: MatSnackBar) {
    if (!this.modelService.model) {
      this.modelService.generateModelFromJson(foursquare);
    }
    this.extractions = modelService.model.extractions;
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
      this.moodPercent = Math.round((this.sentimentCounts.negative / this.sentimentCounts.getOverallCount()) * 100) + '% negative comments';
    } else {
      this.moodPercent = Math.round((this.sentimentCounts.positive / this.sentimentCounts.getOverallCount()) * 100) + '% positive comments';
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
    this.valueCounts.aspect.slice(0, this.maxRankingDisplayItems).forEach(aspect => {
      aspectRankingCounts.push(aspect.count);
      this.aspectRankingLabels.push(aspect.value);
    });
    aspectRankingData.data = aspectRankingCounts;
    this.aspectRankingData.push(aspectRankingData);

    /** Aspect Distribution **/
    const aspectDistributionData: any = {};
    const aspectDistributionCounts = [];

    const counts = this.valueCounts.aspect.map(aspect => aspect.count);
    // TODO: Get datalib somehow and call histogram()


    aspectDistributionData.data = aspectDistributionCounts;
    this.aspectDistributionData.push(aspectDistributionData);

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

  ngOnInit() { }
}
