import { Component, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, ExtractionProperty, FacetProperty, Extractions } from 'src/app/models/canonical';
import { default as dataSet } from 'src/app/models/foursquare_gold.ce.json';
import { SentimentCount, mapToSentiment } from 'src/app/models/sentiment';
import { valueCounts } from 'src/app/models/utils';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import {StringMap} from '../../models/canonical';

@Component({
  selector: 'app-dataset-overview',
  templateUrl: './dataset-overview.component.html',
  styleUrls: ['./dataset-overview.component.scss']
})
export class DatasetOverviewComponent implements OnInit {

  private extractions: Extraction[];
  private values: { attribute: string[], aspect: string[], comment: string[], sentiment: string[]};
  private uniqueValues: { attribute: Set<string>, aspect: Set<string>, comment: Set<string>, sentiment: Set<string> };
  private sentimentCounts: SentimentCount;
  private valueCounts;
  private mood: string;
  private moodPercent: string;
  private warnings: string[] = [];
  private distribution: any[] = [];

  constructor(private modelService: ModelService, private router: Router, private snackBar: MatSnackBar) {
    if (!this.modelService.model) {
      // TODO: set data on upload page
      this.modelService.generateModelFromJson(dataSet);
    }
    this.extractions = modelService.model.rawExtractions;
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
    if (this.sentimentCounts.positive / this.sentimentCounts.getOverallCount() > 0.7) {
      this.mood = 'mostly positive';
      this.moodPercent = Math.round((this.sentimentCounts.positive / this.sentimentCounts.getOverallCount()) * 100) + '% positive comments';
    } else if (this.sentimentCounts.negative / this.sentimentCounts.getOverallCount() > 0.7) {
      this.mood = 'mostly negative';
      this.moodPercent = Math.round((this.sentimentCounts.negative / this.sentimentCounts.getOverallCount()) * 100) + '% negative comments';
    } else {
      this.mood = 'mixed';
      this.moodPercent = Math.round((this.sentimentCounts.positive / this.sentimentCounts.getOverallCount()) * 100) + '% positive comments';
    }

    /** Warnings **/
    if (this.uniqueValues.comment.size < 30) {
      this.warnings.push(`This dataset contains only ${this.uniqueValues.comment.size} comments - ` +
        `some visualisations could be misleading. You should consider adding more data`);
    }
    if (this.sentimentCounts.unknown > 0) {
      this.warnings.push(`Your uploaded model contains ${this.sentimentCounts.unknown} comments with unknown sentiment - ` +
        `These comments will not be shown in most visualisations. Consider correcting your model.`);
    }

    /** Distribution **/
    const aspectGroups: Extraction[][] = this.modelService.model.aspectGroups;
    aspectGroups.forEach( aspect => {
      const miau: string;
    });
    this.distribution.push({category: 'all', commentValue: this.sentimentCounts.getOverallCount(), aspectValue: this.valueCounts.aspect.size});
    this.distribution.push({category: 'positive', commentValue: this.sentimentCounts.positive, aspectValue: this.valueCounts.aspect.size});
    this.distribution.push({category: 'neutral', commentValue: this.sentimentCounts.neutral, aspectValue: this.valueCounts.aspect.size});
    this.distribution.push({category: 'negative', commentValue: this.sentimentCounts.negative, aspectValue: this.valueCounts.aspect.size});
  }

  ngOnInit() {
    this.modelService.generateModelFromJson(dataSet);
  }
}
