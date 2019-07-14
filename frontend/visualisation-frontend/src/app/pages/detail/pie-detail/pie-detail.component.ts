import { Component, OnInit } from '@angular/core';
import { ModelService } from 'src/app/services/model.service';
import { DetailViewBaseComponent } from '../detail-view-base.component';

@Component({
  selector: 'app-pie-detail',
  templateUrl: './pie-detail.component.html',
  styleUrls: ['./pie-detail.component.scss']
})
export class PieDetailComponent extends DetailViewBaseComponent implements OnInit {

  constructor(protected modelService: ModelService) {
    super(modelService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

}
