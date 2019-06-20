import { Component, OnInit, Input } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, sentimentDifferential } from 'src/app/models/canonical';
import { Sentiment, mapToNumber } from 'src/app/models/sentiment';
import { DefaultColorStrings, SentimentColors } from 'src/environments/constants';
import { default as Color } from 'color';

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
      maxDepth: 2,
      hintOpacity: 0.9,
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
    return [name, parent, Math.abs(differential), differential];
  }

  /**
   * Google charts does not allow transparent fill colors.
   * This is a workaround to harmonize the treemap with the chart.js colors.
   */
  private adjustColors() {
    document.querySelectorAll('rect').forEach(node => {
      const oldColor = node.getAttribute('fill');
      node.setAttribute('fill', Color(oldColor).alpha(0.66).string());
      node.setAttribute('stroke', oldColor);
    });
  }
}
