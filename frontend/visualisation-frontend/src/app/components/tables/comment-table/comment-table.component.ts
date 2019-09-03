import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Extraction, Extractions, sentimentDifferential } from 'src/app/models/canonical';

export interface CommentRow { group: string; aspects: string[]; attributes: string[]; sentiment: number; }

@Component({
  selector: 'app-comment-table',
  templateUrl: './comment-table.component.html',
  styleUrls: ['./comment-table.component.scss']
})
export class CommentTableComponent implements OnInit {
  @Input() extractions: Extraction[];

  @ViewChild('paginator') paginator: MatPaginator;

  private tableData: MatTableDataSource<CommentRow>;

  constructor() { }

  ngOnInit() {
    // extract group sentiment counts
    const commentMap = Extractions.groupBy(this.extractions, 'comment');
    const table = Object.entries(commentMap).map(entry => {
      const comment = entry[0];
      const extractions = entry[1];
      const aspects = new Set(extractions.map(e => e.aspect.group));
      const attributes = new Set(extractions.map(e => e.attribute.group));
      return {
        group: comment,
        aspects: Array.from(aspects.values()),
        attributes: Array.from(attributes.values()),
        sentiment: sentimentDifferential(extractions)
      };
    });

    this.tableData = new MatTableDataSource(table);
    this.tableData.paginator = this.paginator;
  }
}
