import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ExtractionGroup, FacetType, Model } from 'src/app/models/canonical';
import { StateService } from 'src/app/services/state.service';
import { SentimentTableComponent } from '../sentiment-table/sentiment-table.component';

@Component({
  selector: 'app-merged-members-table',
  templateUrl: './merged-members-table.component.html',
  styleUrls: ['./merged-members-table.component.scss']
})
export class MergedMembersTableComponent extends SentimentTableComponent implements OnInit, OnChanges {
  @Input() group: ExtractionGroup;
  public get facetType(): FacetType {
    return this.group.type as FacetType;
  }

  protected get model(): Model {
    return this.stateService.model.state;
  }
  protected get groups(): ExtractionGroup[] {
    return this.model.getMergedGroups(this.group);
  }

  constructor(stateService: StateService, private snackBar: MatSnackBar) {
    super(stateService);
  }

  ngOnInit() {
    super.ngOnInit();
  }
  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
  }

  public update() {
    this.displayGroups = this.groups.slice();
  }

  public split(id: string) {
    this.model.splitById(this.group.id, id);
    const split = this.model.getGroupById(id).name;
    this.update();
    this.generateTableData();
    this.snackBar.open(`Split '${split}' from '${this.group.name}'`, 'undo', { duration: 5000 } )
      .onAction()
      .subscribe(
        () => {
          this.model.mergeById(this.group.id, id);
          this.update();
          this.generateTableData();
        }
      );
  }
}
