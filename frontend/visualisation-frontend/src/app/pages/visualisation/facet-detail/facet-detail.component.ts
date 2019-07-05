import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { Extraction, Extractions, StringMap } from 'src/app/models/canonical';
import { default as data } from 'src/app/models/foursquare_gold.ce.json';
import { SentimentCount } from 'src/app/models/sentiment';
import { MatPaginator, MatTableDataSource } from '@angular/material';

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
export class FacetDetailComponent implements OnInit {
  @Input() facet = 'DRINKS'; // TODO: remove after testing
  @Input() facetType: 'aspect' | 'attribute' = 'aspect';

  @ViewChild('otherPaginator') otherPaginator: MatPaginator;
  @ViewChild('subGroupPaginator') subGroupPaginator: MatPaginator;

  private extractions: Extraction[];
  private others: StringMap<Extraction[]>;
  private otherType: 'aspect' | 'attribute' = 'attribute';
  private otherTable: MatTableDataSource<SentimentCountRow>;
  private subGroupTable: MatTableDataSource<SentimentCountRow>;

  constructor(private modelService: ModelService) {
    if (!modelService.model) {
      this.modelService.generateModelFromJson(data);
    }
  }
  // TODO: refactor
  ngOnInit() {
    this.otherType = this.facetType === 'aspect' ? 'attribute' : 'aspect';
    this.extractions = Extractions.groupBy(this.modelService.model.rawExtractions, this.facetType)[this.facet];
    this.others = Extractions.groupBy(this.extractions, this.otherType);

    // extract group sentiment counts
    const otherGroups = [...Object.keys(this.others)];
    const otherSentimentCounts = [...Object.values(this.others)]
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
