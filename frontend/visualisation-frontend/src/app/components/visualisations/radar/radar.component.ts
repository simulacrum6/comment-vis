import { Component, OnInit, Input } from '@angular/core';
import { RadialChartOptions } from 'chart.js';
import { StateService } from 'src/app/services/state.service';
import { ExtractionGroup, sentimentDifferential, diversity } from 'src/app/models/canonical';
import { controversy } from 'src/app/models/sentiment';

class RadarPoint {
  public group: ExtractionGroup;
  public name: string;
  public popularity: number;
  public sentiment: number;
  public controversy: number;
  public diversity: number;

  public static fromGroup(group: ExtractionGroup) {
    const point = new RadarPoint();
    point.group = group;
    point.name = group.name;
    point.popularity = group.extractions.length;
    // TODO: scale all values
    point.sentiment = sentimentDifferential(group.extractions) * 100;
    point.controversy = controversy(group.sentimentCount) * 60;
    point.diversity = diversity(group) * 30;
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
  public datasets = [];

  private options: RadialChartOptions = { responsive: true };
  private radarLabels = [ 'popularity', 'sentiment', 'controversy', 'diversity' ];

  constructor(private stateService: StateService) {
    const model = stateService.model.state;
    const groups = model.getGroupsFor('aspect').slice(0, 4);
    this.datasets = groups.map(RadarPoint.fromGroup).map(RadarPoint.asDataSet);
  }

  ngOnInit() {
  }

}
