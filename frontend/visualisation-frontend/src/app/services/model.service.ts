import { Injectable } from '@angular/core';
import { Model, parseJson } from '../models/canonical';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  public model: Model;

  constructor() { }

  generateModelFromJson(json: any[]): void {
    this.model = new Model(parseJson(json));
  }
}
