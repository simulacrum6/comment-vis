import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';

export class Coordinate {
  constructor(public x = 0, public y = 0) { }

  static fromArray(coordinates: [number, number]) {
    return new Coordinate(coordinates[0], coordinates[1]);
  }
}

export type LayoutName = 'random' | 'meaning' | 'clustered';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  static readonly APIUrl = environment.layoutService.url;
  static readonly Meaning = 'layout/embeddings';
  static readonly Clustered = 'layout/clustered';

  private _layout: BehaviorSubject<Coordinate[]> = new BehaviorSubject([]);
  private _isAvailable: BehaviorSubject<boolean> = new BehaviorSubject(true);

  layoutChanges: Observable<Coordinate[]> = this._layout;
  availabilityChanges: Observable<boolean> = this._isAvailable.asObservable();

  get layout(): Coordinate[] {
    return this._layout.getValue();
  }
  get isAvailable(): boolean {
    return this._isAvailable.getValue();
  }

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  /**
   * Returns n random points between 0 and 100.
   */
  static randomLayout(n: number): Coordinate[] {
    const layout = [];
    while (layout.length < n) {
      layout.push({ x: Math.random() * 100, y: Math.random() * 100 });
    }
    return layout;
  }

  private checkService(): Observable<any> {
    const available = this.http.get(LayoutService.APIUrl);
    available.subscribe(
      next => this._isAvailable.next(true),
      error => this._isAvailable.next(false)
    );
    return available;
  }

  getRandomLayout(words: string[]): Coordinate[] {
    const layout = LayoutService.randomLayout(words.length);
    this._layout.next(layout);
    return layout;
  }

  getMeaningLayout(words: string[]): Observable<Coordinate[]> {
      const body = { words, range: [0, 100] };
      const url = LayoutService.APIUrl + LayoutService.Meaning;
      const options = { headers: { 'Content-Type': 'application/json' } };
      this.snackBar.open('Retrieving new layout from server...');
      const layout = this.http.post(url , body, options) as Observable<{ points: [number, number][]}>;
      const coordinates = layout.pipe(
        map(response => response.points.map(Coordinate.fromArray))
      );
      layout.subscribe(
        success => this.snackBar.open('Success!', 'ok', { duration: 3500 }),
        error => this.snackBar.open('ERROR: Could not retrieve Layout...', ':(', { duration: 3500 }));
      coordinates.subscribe(coords => this._layout.next(coords));
      return coordinates;
  }

  getClusteredLayout(words: string[]): Observable<Coordinate[]> {
    const body = { words, range: [0, 100] };
    const url = LayoutService.APIUrl + LayoutService.Clustered;
    const options = { headers: { 'Content-Type': 'application/json' } };
    this.snackBar.open('Retrieving new layout from server...');
    const layout = this.http.post(url , body, options) as Observable<{ points: [number, number][]}>;
    const coordinates = layout.pipe(
      map(response => response.points.map(Coordinate.fromArray))
    );
    layout.subscribe(
      success => this.snackBar.open('Success!', 'ok', { duration: 3500 }),
      error => this.snackBar.open('ERROR: Could not retrieve Layout...', ':(', { duration: 3500 }));
    coordinates.subscribe(coords => this._layout.next(coords));
    return coordinates;
  }

  getLayout(words: string[], kind: LayoutName): Observable<Coordinate[]> {
    console.log('get layout called');
    if (kind === 'meaning') {
      console.log('fetching "meaning" layout');
      return this.getMeaningLayout(words);
    }
    if (kind === 'clustered') {
      console.log('fetching "clustered" layout');
      return this.getClusteredLayout(words);
    }
    if (kind === 'random') {
      console.log('fetching "random" layout');
      const layout = this.getRandomLayout(words);
      return of(layout);
    }

    throw new Error(`No Layout with name ${kind} available.`);
  }
}
