import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Extraction, Extractions } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { MatPaginator, MatTableDataSource } from '@angular/material';

export interface SentimentCountRow {
  group: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

@Component({
  selector: 'app-sentiment-table',
  templateUrl: './sentiment-table.component.html',
  styleUrls: ['./sentiment-table.component.scss']
})
export class SentimentTableComponent implements OnInit {
  @Input() extractions: Extraction[];
  @Input() facetType: 'aspect' | 'attribute';

  @ViewChild('paginator') paginator: MatPaginator;

  private tableData: MatTableDataSource<SentimentCountRow>;

  constructor() { }

  ngOnInit() {
    // extract group sentiment counts
    const facetGroupMap = Extractions.groupBy(this.extractions, this.facetType);
    const facetGroups = Object.keys(facetGroupMap);
    const sentimentCounts = Object.values(facetGroupMap)
      .map(extractions => extractions.map(e => e.sentiment))
      .map(SentimentCount.fromArray);

    // create data table
    const table: SentimentCountRow[] = [];
    for (let i = 0; i < sentimentCounts.length; i++) {
      const groupName = facetGroups[i];
      const count = sentimentCounts[i];
      const tableEntry = { group: groupName, ...count, total: count.getOverallCount() };
      table.push(tableEntry);
    }
    this.tableData = new MatTableDataSource(table);
    this.tableData.paginator = this.paginator;
  }

}
