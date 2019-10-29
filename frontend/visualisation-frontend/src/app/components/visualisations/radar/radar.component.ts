import { Component, OnInit, Input } from '@angular/core';
import { RadialChartOptions } from 'chart.js';
import { StateService } from 'src/app/services/state.service';
import { ExtractionGroup, sentimentDifferential, diversity } from 'src/app/models/canonical';
import { controversy } from 'src/app/models/sentiment';
import { sum } from 'src/app/models/utils';

class RadarPoint {
  public group: ExtractionGroup;
  public name: string;
  public popularity: number;
  public sentiment: number;
  public controversy: number;
  public diversity: number;

  public static fromGroup(group: ExtractionGroup, scalingFactor = 100) {
    const point = new RadarPoint();
    point.group = group;
    point.name = group.name;
    point.popularity = group.extractions.length;
    point.sentiment = sentimentDifferential(group.extractions) * scalingFactor;
    point.controversy = controversy(group.sentimentCount) * scalingFactor;
    point.diversity = diversity(group) * scalingFactor;
    return point;
  }

  public static asDataSet(point: RadarPoint) {
    return {
      label: point.name,
      data: [ point.popularity, point.sentiment, point.controversy, point.diversity ]
    };
  }
}

@Component({
  selector: 'app-radar',
  templateUrl: './radar.component.html',
  styleUrls: ['./radar.component.scss']
})
export class RadarComponent implements OnInit {

  @Input()
  public set groups(groups: ExtractionGroup[]) {
    this._groups = groups;
    this.update();
  }
  public get groups(): ExtractionGroup[] {
    return this._groups;
  }

  private _groups = [];
  public datasets = [];
  public options: RadialChartOptions = { responsive: true };
  public radarLabels = [ 'popularity', 'sentiment', 'controversy', 'diversity' ];

  constructor(private stateService: StateService) {
    const model = stateService.model.state;
    // TODO: delete after testing
    this.groups = model.getGroupsFor('aspect').slice(0, 4);
    this.update();
  }

  ngOnInit() {
  }

  public update() {
    const maxPopularity = this.groups
      .map(group => group.extractions.length)
      .reduce((a, b) => Math.max(a, b));
    const scalingFactor = Math.max(100, maxPopularity);
    this.datasets = this.groups
      .map(group => RadarPoint.fromGroup(group, scalingFactor))
      .map(RadarPoint.asDataSet);
  }
}
