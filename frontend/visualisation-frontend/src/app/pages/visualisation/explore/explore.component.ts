import { Component, OnInit } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';
import { FilterOption, FilterType } from 'src/app/services/filter';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {

  constructor(private filterService: FilterService) { }

  ngOnInit() {
  }

  public onFilterRemoval(removeEvent: { option: FilterOption, type: FilterType }) {
    this.filterService.remove(removeEvent.option, removeEvent.type);
  }

}
