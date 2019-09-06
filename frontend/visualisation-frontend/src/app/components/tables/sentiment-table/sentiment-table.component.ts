import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { SortOption, SortOptions } from 'src/app/components/filters/sort-filter/sort';
import { Extraction, ExtractionGroup, Extractions, FacetProperty, FacetType } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';

export class SentimentCountRow {
  group: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;

  public static fromExtractionGroup(group: ExtractionGroup): SentimentCountRow {
    const row = { group: group.name, ...group.sentimentCount, total: group.sentimentCount.total};
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

  // TODO: implement clean
  private positiveSort: SortOption = SortOptions.options.positiveSentiments;
  private negativeSort: SortOption = SortOptions.options.negativeSentiments;
  private neutralSort: SortOption = SortOptions.options.neutralSentiments;
  private totalSort: SortOption = SortOptions.options.popularity;

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
    this.groups = Extractions.toViewGroups(this.extractions, this.facetType, this.facetProperty);
    this.displayGroups = this.groups.slice();
  }

  generateTableData() {
    const rows: SentimentCountRow[] = this.displayGroups.map(SentimentCountRow.fromExtractionGroup);

    this.tableData = new MatTableDataSource(rows);
    this.tableData.paginator = this.paginator;
  }

  onSort(groups: ExtractionGroup[]) {
    this.displayGroups = groups;
    this.generateTableData();
  }
}
