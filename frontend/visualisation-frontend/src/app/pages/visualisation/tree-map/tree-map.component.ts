import { Component, OnInit, Input } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts/google-charts-interfaces';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, sentimentDifferential } from 'src/app/models/canonical';
import { Sentiment, mapToNumber, mapToSentimentStatement } from 'src/app/models/sentiment';
import { DefaultColorStrings, SentimentColors } from 'src/environments/constants';
import { default as Color } from 'color';
import { flatten } from 'src/app/models/utils';

@Component({
  selector: 'app-tree-map',
  templateUrl: './tree-map.component.html',
  styleUrls: ['./tree-map.component.scss']
})
export class TreeMapComponent implements OnInit {

  @Input() facetType: 'aspect' | 'attribute' = 'aspect';
  private otherType: 'aspect' | 'attribute' = 'attribute';

  /**
   * Data Table containing the Sentiment Difference Values.
   */
  public data: any[][] = [];

  public chart: GoogleChartInterface = {
    chartType: 'TreeMap',
    dataTable: this.data,
    options: {
      title: 'Sentiment Difference',
      minHighlightColor: DefaultColorStrings.hoverBackgroundColor.negative,
      midHighlightColor: DefaultColorStrings.hoverBackgroundColor.neutral,
      maxHighlightColor: DefaultColorStrings.hoverBackgroundColor.positive,
      minColor: DefaultColorStrings.backgroundColor.negative,
      midColor: DefaultColorStrings.backgroundColor.neutral,
      maxColor: DefaultColorStrings.backgroundColor.positive,
      maxDepth: 2,
      maxPostDepth: 3,
      hintOpacity: 0.66,
      height: 420,
      generateTooltip: this.tooltip.bind(this),
      showScale: true,
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
    this.otherType = this.facetType === 'aspect' ? 'attribute' : 'aspect';
    this.resetData();
    const extractions = this.modelService.model.rawExtractions;
    const facetMap = Extractions.groupBy(extractions, this.facetType);
    const entries = Object.entries(facetMap).map(this.toTableEntry);
    const subEntries = Object.entries(facetMap).map(entry => this.toNestedTableEntries(entry));
    this.data = this.data.concat(entries, flatten(subEntries));
    this.chart.dataTable = this.data;
    this.dataIsVisualisable = true; // TODO: Change to function check.
  }

  private resetData() {
    this.data = [
      ['Unit', 'Parent', 'Sentiment Difference', 'Color'],
      ['total', null, 0, mapToNumber(Sentiment.Unknown)],
      ['positive', 'total', 1 / 10000, mapToNumber(Sentiment.Positive)],
      ['negative', 'total', 1 / 10000, mapToNumber(Sentiment.Negative)]
    ];
  }

  /**
   * Maps Facet Entries (Tuples of its name and corresponding extractions) to a data table entry.
   */
  private toTableEntry([name, extractions]): [string, string, number, number] {
    const differential = sentimentDifferential(extractions);
    const parent = differential < 0 ? 'negative' : 'positive';
    return [name, parent, extractions.length, differential];
  }

  /**
   * Maps Facet Entries (Tuples of its name and corresponding extractions) to a data table entry with subtype.
   */
  private toNestedTableEntries([name, extractions]): [string, string, number, number][] {
    const facetMap = Extractions.groupBy(extractions, this.otherType);
    const groups = Object.entries(facetMap);
    const subGroups = groups.map(([subName, subExtractions]) => [
      `${subName} (${name})`,
      name,
      subExtractions.length,
      sentimentDifferential(subExtractions)]);
    return subGroups as [string, string, number, number][];
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

  private tooltip(rowId: number, size: number, value: number) {
    const plus = value >= 0 ? '+' : '';
    const sentiment = mapToSentimentStatement(value);
    return `<div style="
        background-color: ${Color(DefaultColorStrings.hoverBackgroundColor.unknown).hex()};
        opacity: 67%;
        padding: 5px;
        border-radius: 5px">
      <span style="font-weight: 500">${this.data[rowId + 1][0]}</span>
      was mentioned <span style="font-weight: 500">${size}</span> times.<br>
      Opinions were <span style="font-weight: 500">${sentiment}</span> (${plus}${value.toFixed(3)}).
    </div>`;
  }
}
