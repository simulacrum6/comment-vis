import { Component, OnInit, Input, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Extraction, Extractions, FacetType, FacetProperty, ExtractionGroup } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

export class SentimentCountRow {
  group: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;

  public static fromExtractionGroup(group: ExtractionGroup): SentimentCountRow {
    const row = { group: group.name, ...group.sentimentCount, total: group.sentimentCount.getOverallCount()};
    return row;
  }
}

@Component({
  selector: 'app-sentiment-table',
  templateUrl: './sentiment-table.component.html',
  styleUrls: ['./sentiment-table.component.scss']
})
export class SentimentTableComponent implements OnInit, OnChanges {
  @Input() extractions: Extraction[];
  @Input() facetType: FacetType;
  @Input() facetProperty: FacetProperty = 'group';

  /**
   * Indicates whether router links are active, i.e. whether navigation is possible from the table.
   */
  @Input() links = true;

  @ViewChild('paginator') paginator: MatPaginator;

  private groups: ExtractionGroup[];
  private displayGroups: ExtractionGroup[];
  private tableData: MatTableDataSource<SentimentCountRow>;



  constructor(private router: Router) { }

  ngOnInit() {
    this.update();
    this.generateTableData();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.update();
    this.generateTableData();
  }

  update() {
    this.groups = Extractions.toGroups(this.extractions, this.facetType, this.facetProperty);
    this.displayGroups = this.groups.slice();
  }

  generateTableData() {
    const rows: SentimentCountRow[] = this.displayGroups.map(SentimentCountRow.fromExtractionGroup);

    this.tableData = new MatTableDataSource(rows);
    this.tableData.paginator = this.paginator;
  }

  onSortFilter(groups: ExtractionGroup[]) {
    this.displayGroups = groups;
    this.generateTableData();
  }
}
