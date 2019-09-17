import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilterService } from 'src/app/services/filter.service';
import { FilterOption, FilterType } from 'src/app/services/filter';
import { Subscription, combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, OnDestroy {

  private breadCrumbPaths = [
    { name: 'Statistics', path: ['/stats']},
    { name: 'Explore', path: ['/vis/explore/']}
  ];

  private subs: Subscription = new Subscription();

  constructor(private filterService: FilterService, private route: ActivatedRoute, private stateService: StateService) { }

  ngOnInit() {
    // set up url for return from detail page.
    this.subs = combineLatest(this.route.url, this.route.params).subscribe(
      ([url, params]) => {
        const path = ['/vis/' + url.join('/')];
        this.stateService.lastPage.state = { url: path, queryParams: params };
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  public onFilterRemoval(removeEvent: { option: FilterOption, type: FilterType }) {
    this.filterService.remove(removeEvent.option, removeEvent.type);
  }

}
