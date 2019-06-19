import { Component, OnInit, Input } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, sentimentDifferential } from 'src/app/models/canonical';
import { Sentiment, mapToNumber } from 'src/app/models/sentiment';
import { SentimentColors, DefaultColorStrings } from 'src/environments/constants';

@Component({
  selector: 'app-tree-map',
  templateUrl: './tree-map.component.html',
  styleUrls: ['./tree-map.component.scss']
})
export class TreeMapComponent implements OnInit {

  @Input() facetType: 'aspect' | 'attribute' = 'aspect';

  public data = [
    ['Unit', 'Parent', 'Sentiment Difference', 'Color'],
    ['Root', null, 0, Sentiment.Unknown],
    ['positive', 'Root', 1, mapToNumber(Sentiment.Positive)],
    ['negative', 'Root', 1, mapToNumber(Sentiment.Negative)]
  ];

  public chart: GoogleChartInterface = {
    chartType: 'TreeMap',
    dataTable: this.data,
    //opt_firstRowIsData: true,
    options: {
      title: 'Sentiment Difference',
      minColor: DefaultColorStrings.backgroundColor.negative,
      midColor: DefaultColorStrings.backgroundColor.neutral,
      maxColor: DefaultColorStrings.backgroundColor.positive,
    },
  };
  public positives: GoogleChartInterface;
  public negatives: GoogleChartInterface;

  // TODO: add type to model
  private facetGroups: { name: string, extractions: Extraction[] }[];

  constructor(private modelService: ModelService) { }

  ngOnInit() {
    const extractions = this.modelService.model.rawExtractions;
    const facetMap = Extractions.groupBy(extractions, this.facetType);
    const entries = Object.entries(facetMap).map(this.toTableEntry);
    this.resetData();
    this.data = this.data.concat(entries);
    this.chart.dataTable = this.data;
    this.positives = this.getChartObject(this.data.filter(entry => entry[1] === 'positive'), 'positive');
    this.negatives = this.getChartObject(this.data.filter(entry => entry[1] === 'negative'), 'negative');
  }

  private resetData() {
    this.data = [
      ['Unit', 'Parent', 'Sentiment Difference', 'Color'],
      ['Root', null, 0, mapToNumber(Sentiment.Unknown)],
      ['positive', 'Root', 1, mapToNumber(Sentiment.Positive)],
      ['negative', 'Root', 1, mapToNumber(Sentiment.Negative)]
    ];
  }

  /**
   * Maps Facet Entries (Tuples of its name and corresponding extractions) to a data table entry.
   */
  private toTableEntry([name, extractions]): [string, string, number, number] {
    const differential = sentimentDifferential(extractions);
    const parent = differential < 0 ? 'negative' : 'positive';
    return [name, parent, Math.abs(differential), Math.abs(differential)];
  }

  private getChartObject(data, sentiment: 'positive' | 'negative'): GoogleChartInterface {
    const table = [
      ['Unit', 'Parent', 'Sentiment Difference', 'Color'],
      [sentiment, null, 0, mapToNumber(Sentiment.Unknown)]
    ];
    console.log(data)
    return {
      chartType: 'TreeMap',
      dataTable: table.concat(data),
      //opt_firstRowIsData: true,
      options: {
        title: sentiment,
        minColor: DefaultColorStrings.backgroundColor.neutral,
        maxColor: DefaultColorStrings.backgroundColor[sentiment],
      },
    }
  }
}
