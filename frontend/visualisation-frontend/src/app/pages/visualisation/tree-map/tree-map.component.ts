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

  /**
   * Data Table containing the Sentiment Difference Values.
   */
  public data: any[][] = [];

  public chart: GoogleChartInterface = {
    chartType: 'TreeMap',
    dataTable: this.data,
    options: {
      title: 'Sentiment Difference',
      minColor: DefaultColorStrings.backgroundColor.negative,
      midColor: DefaultColorStrings.backgroundColor.neutral,
      maxColor: DefaultColorStrings.backgroundColor.positive,
      maxDepth: 3,
      hintOpacity: 0.9,
      height: 420
    },
  };

  /**
   * Indicates, whether data makes sense to visualise.
   * E.g., if there is no Facet, which is mostly positive or mostly negative,
   * this visualisation makes no sense to show.
   */
  private dataIsVisualisable = false;

  constructor(private modelService: ModelService) { }

  ngOnInit() {
    this.resetData();
    const extractions = this.modelService.model.rawExtractions;
    const facetMap = Extractions.groupBy(extractions, this.facetType);
    const entries = Object.entries(facetMap).map(this.toTableEntry);
    this.data = this.data.concat(entries);
    this.chart.dataTable = this.data;
    this.dataIsVisualisable = true; // TODO: Change to function check.
  }

  private resetData() {
    this.data = [
      ['Unit', 'Parent', 'Sentiment Difference', 'Color'],
      ['Root', null, 0, mapToNumber(Sentiment.Unknown)],
      ['positive', 'Root', 0, mapToNumber(Sentiment.Positive)],
      ['negative', 'Root', 0, mapToNumber(Sentiment.Negative)]
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
   * Checks whether data makes sense to be visualised.
   * Returns true if data is visualisable.
   */
  private checkIfVisualisable() {
    this.chart.dataTable = this.data;
    const negatives = this.data.filter(row => row[2] < 0);
    const positives = this.data.filter(row => row[2] > 0);
    return !(positives.length === 0 || negatives.length === 0);
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
