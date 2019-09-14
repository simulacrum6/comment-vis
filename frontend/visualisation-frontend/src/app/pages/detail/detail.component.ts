import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  private static readonly FacetKey: string = 'facet';
  private static readonly FacetTypeKey: string = 'facetType';

  /** An observable of the facet name to show details for. */
  public facet$: Observable<string>;

  /** An observable of the facet type to show details for. */
  public facetType$: Observable<string>;

  /** An observable, indicating whether the required query params are present. */
  public hasAllParams$: Observable<boolean>;

  public errorMessage = 'Query Parameters "facet" and "facetType" must be provided in the url to this page.';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.facet$ = this.route.queryParamMap.pipe(
      map((paramMap: ParamMap) => paramMap.get(DetailComponent.FacetKey))
    );
    this.facetType$ = this.route.queryParamMap.pipe(
      map((paramMap: ParamMap) => paramMap.get(DetailComponent.FacetTypeKey))
    );
    this.hasAllParams$ = this.route.queryParamMap.pipe(
      map((paramMap: ParamMap) => paramMap.has(DetailComponent.FacetKey) && paramMap.has(DetailComponent.FacetTypeKey))
    );
  }
}
