import {Component, OnInit, ViewChild} from '@angular/core';
import {FilterService} from '../../../services/filter.service';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {ExtractionGroup, Extractions, Model, sentimentDifferential} from '../../../models/canonical';
import {StateService} from '../../../services/state.service';

export interface CommentRow { group: string; aspects: string[]; attributes: string[]; sentiment: number; }

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @ViewChild('paginator') paginator: MatPaginator;

  private tableData: MatTableDataSource<CommentRow>;
  private searchedFacetGroups: ExtractionGroup[];

  constructor(private stateService: StateService, private filterService: FilterService) {
    this.searchedFacetGroups = filterService.filteredData.slice();
  }

  ngOnInit() {
    /*const commentMap = Extractions.groupBy(this.stateService.model.state.extractions, 'comment');
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
    });*/

    const groups = this.stateService.model.state.getGroupsFor('comment');
//      .filter(value => this.searchedFacetGroups.findIndex((group) => group.id === value.id) !== -1);
    //TODO: How to actually filter for comments?

    const table = groups.map(entry => {
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

    const filterSubscription = this.filterService.filteredDataChange.subscribe(
      filtered => this.onFilter(filtered)
    );
  }

  public onFilter(filtered: ExtractionGroup[]) {
    this.searchedFacetGroups = filtered;
    //this.ngOnInit();
    //this.searchedFacetGroups = filtered;
    // TODO
    // this.updatePaginator({ pageIndex: 0, pageSize: this.currentPageSize, length: this.searchedFacetGroups.length });
  }

}
