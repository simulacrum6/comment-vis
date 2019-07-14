import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, StringMap } from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { DetailViewBaseComponent } from '../detail-view-base.component';

export interface SentimentCountRow {
  group: string;
  positive: number;
  negative: number;
  neutral: number;
}

@Component({
  selector: 'app-facet-detail',
  templateUrl: './facet-detail.component.html',
  styleUrls: ['./facet-detail.component.scss']
})
export class FacetDetailComponent extends DetailViewBaseComponent implements OnInit {
  @ViewChild('otherPaginator') otherPaginator: MatPaginator;
  @ViewChild('subGroupPaginator') subGroupPaginator: MatPaginator;

  private otherTable: MatTableDataSource<SentimentCountRow>;
  private subGroupTable: MatTableDataSource<SentimentCountRow>;

  constructor(protected modelService: ModelService) {
    super(modelService);
  }

  // TODO: refactor
  ngOnInit() {
    super.ngOnInit();

    // extract group sentiment counts
    const otherGroups = [...Object.keys(this.subGroups)];
    const otherSentimentCounts = [...Object.values(this.subGroups)]
      .map(extractions => extractions.map(e => e.sentiment))
      .map(SentimentCount.fromArray);

    // create data table
    const otherTable: SentimentCountRow[] = [];
    for (let i = 0; i < otherSentimentCounts.length; i++) {
      const groupName = otherGroups[i];
      const count = otherSentimentCounts[i];
      const tableEntry = { group: groupName, ...count };
      otherTable.push(tableEntry);
    }
    this.otherTable = new MatTableDataSource(otherTable);
    this.otherTable.paginator = this.otherPaginator;

    // extract subgroup sentiment counts
    const subGroupMap = Extractions.groupBy(this.extractions, this.facetType, 'text');
    const subGroups = [...Object.keys(subGroupMap)];
    const subSentimentCounts = [...Object.values(subGroupMap)]
      .map(extractions => extractions.map(e => e.sentiment))
      .map(SentimentCount.fromArray);

    // create data table
    const subGroupTable: SentimentCountRow[] = [];
    for (let i = 0; i < subGroups.length; i++) {
      const groupName = subGroups[i];
      const count = subSentimentCounts[i];
      const tableEntry = { group: groupName, ...count };
      subGroupTable.push(tableEntry);
    }
    this.subGroupTable = new MatTableDataSource(subGroupTable);
    this.subGroupTable.paginator = this.subGroupPaginator;
  }
}
