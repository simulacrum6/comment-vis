import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { ExtractionGroup, sentimentDifferential } from '../../../models/canonical';

export interface CommentRow { group: string; aspects: string[]; attributes: string[]; sentiment: number; }

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  private tableData: MatTableDataSource<CommentRow>;
  private _comments: ExtractionGroup[] = [];

  public get comments(): ExtractionGroup[] {
    return this._comments;
  }
  @Input()
  public set comments(groups: ExtractionGroup[]) {
    this._comments = groups;
    this.update();
  }

  @ViewChild('paginator')
  public paginator: MatPaginator;

  constructor() {}

  ngOnInit() {
    this.update();
  }

  public update() {
    const table = this.comments.map(entry => {
      const comment = entry.name;
      const extractions = entry.extractions;
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
