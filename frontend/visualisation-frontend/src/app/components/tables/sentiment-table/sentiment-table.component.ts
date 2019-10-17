import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { SortOption, SortOptions } from 'src/app/components/controls/filters/sort-filter/sort';
import {Extraction, ExtractionGroup, Extractions, FacetProperty, FacetType, ExtractionProperty, FacetTypes} from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import {StateService} from '../../../services/state.service';

export class SentimentCountRow {
  public id: string;
  public group: string;
  public positive: number;
  public negative: number;
  public neutral: number;
  public total: number;

  public static fromExtractionGroup(group: ExtractionGroup): SentimentCountRow {
    const row = { id: group.id, group: group.name, ...group.sentimentCount, total: group.sentimentCount.total};
    return row;
  }
}

@Component({
  selector: 'app-sentiment-table',
  templateUrl: './sentiment-table.component.html',
  styleUrls: ['./sentiment-table.component.scss']
})
export class SentimentTableComponent implements OnInit, OnChanges {
  /**
   * Indicates whether router links are active, i.e. whether navigation is possible from the table.
   */
  @Input() links = true;
  @Input() extractions: Extraction[];
  @Input('facetType') facetType: FacetType;
  @Input() facetProperty: FacetProperty = 'group';
  @ViewChild('paginator') paginator: MatPaginator;

  protected groups: ExtractionGroup[];
  protected displayGroups: ExtractionGroup[];
  protected tableData: MatTableDataSource<SentimentCountRow>;
  protected positiveSort: SortOption = SortOptions.options.positiveSentiments;
  protected negativeSort: SortOption = SortOptions.options.negativeSentiments;
  protected neutralSort: SortOption = SortOptions.options.neutralSentiments;
  protected totalSort: SortOption = SortOptions.options.popularity;

  _facetTypeVisibleName: string;

  constructor(protected stateService: StateService) { }

  ngOnInit() {
    this._facetTypeVisibleName = FacetTypes.getVisibleName(this.facetType);
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
