import { Component, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, ExtractionProperty, FacetProperty, Extractions } from 'src/app/models/canonical';
import { default as dataSet } from 'src/app/models/mock2.ce.json';
import { SentimentCount, mapToSentiment } from 'src/app/models/sentiment';
import { valueCounts } from 'src/app/models/utils';
import { Router } from '@angular/router';

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

  constructor(private modelService: ModelService, private router: Router) {
    if (!modelService.model) {
      modelService.generateModelFromJson(dataSet);
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
    }
  }

  ngOnInit() {
  }
}
