import { Component, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';
import { Extractions } from 'src/app/models/canonical';

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {

  public comments: string[];
  public members: Set<string>;

  constructor(protected modelService: ModelService) {
    super(modelService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.comments = Object.keys(Extractions.groupBy(this.extractions, 'comment'));
    this.members = new Set(this.extractions.map(e => e[this.facetType].text));
    console.log(this.extractions.map(e => e[this.facetType].text));
  }
}
