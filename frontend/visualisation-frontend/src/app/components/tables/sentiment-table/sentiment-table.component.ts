import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import {MatPaginator, MatSnackBar, MatTableDataSource} from '@angular/material';
import { Router } from '@angular/router';
import { SortOption, SortOptions } from 'src/app/components/controls/filters/sort-filter/sort';
import {Extraction, ExtractionGroup, Extractions, FacetProperty, FacetType, ExtractionProperty, FacetTypes} from 'src/app/models/canonical';
import { SentimentCount } from 'src/app/models/sentiment';
import {StateService} from '../../../services/state.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Model} from '../../../models/canonical';

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
  @Input() protected groups: ExtractionGroup[];

  @Output() merge: EventEmitter<void> = new EventEmitter<void>();
  protected displayGroups: ExtractionGroup[];
  protected tableData: MatTableDataSource<SentimentCountRow>;
  protected positiveSort: SortOption = SortOptions.options.positiveSentiments;
  protected negativeSort: SortOption = SortOptions.options.negativeSentiments;
  protected neutralSort: SortOption = SortOptions.options.neutralSentiments;
  protected totalSort: SortOption = SortOptions.options.popularity;

  _facetTypeVisibleName: string;

  protected get model(): Model {
    return this.stateService.model.state;
  }

  constructor(protected stateService: StateService, protected snackBar: MatSnackBar) { }

  ngOnInit() {
    this._facetTypeVisibleName = FacetTypes.getVisibleName(this.facetType);
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.update();
    this.generateTableData();
  }

  initialize() {
    this.update();
    this.generateTableData();
  }

  update() {
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

  onDragAndDrop(event: CdkDragDrop<SentimentCountRow>) {
    if (!event.isPointerOverContainer) {
      return;
    }
    if (event.previousContainer === event.container) {
      return;
    }

    console.log(event.previousContainer)

    console.log(event.container)

    // TODO: This does not work because the ids are not set in first place
    const mergee = this.displayGroups.find(element => element.id === event.previousContainer.data.id);
    const receiver = this.displayGroups.find(element => element.id === event.container.data.id);

    console.log(`mergee: ${mergee.name}, receiver: ${receiver.name}`);

    if (!mergee || !receiver) {
      return;
    }

    if (receiver.id === mergee.id) {
      return;
    }

    this.model.merge(receiver, mergee);
    this.merge.emit()

    this.initialize();

    const snackRef = this.snackBar.open(`Merged '${mergee.name}' into '${receiver.name}'`, 'undo', { duration: 5000 });
    snackRef.onAction()
      .subscribe(() => {
        this.model.split(receiver, mergee);
        this.merge.emit();
        this.initialize();
      });
  }
}
