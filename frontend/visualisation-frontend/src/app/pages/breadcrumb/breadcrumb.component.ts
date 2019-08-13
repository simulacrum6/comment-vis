import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

export interface BreadCrumbElement {
  name: string;
  path: string[];
  queryParams?: any;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnChanges {
  @Input() paths: BreadCrumbElement[];

  private current: BreadCrumbElement;
  private previous: BreadCrumbElement[];

  constructor() {
  }

  ngOnInit() {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  update() {
    this.current = this.paths[this.paths.length - 1];
    this.previous = this.paths.slice(0, -1);
  }

}
