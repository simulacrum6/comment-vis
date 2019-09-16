import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExtractionGroup, Extractions } from 'src/app/models/canonical';
import { flatten } from 'src/app/models/utils';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-inspect',
  templateUrl: './inspect.component.html',
  styleUrls: ['./inspect.component.scss']
})
export class InspectComponent implements OnInit {

  private comments: Observable<ExtractionGroup[]>;

  constructor(private filterService: FilterService) { }

  ngOnInit() {
    this.comments = this.filterService.filteredDataChange.pipe(
      map(filtered => flatten(filtered.map(group => group.extractions))),
      map(extractions => Extractions.toViewGroups(extractions, 'comment'))
    );
  }

}
