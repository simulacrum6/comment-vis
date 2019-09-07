import { Extraction, parseJson, Model, RawExtraction } from './canonical';
import { default as evaluations } from 'src/app/models/evaulations.ce.json';
import { default as foursquare } from 'src/app/models/foursquare_gold.ce.json';
import { default as reviews } from 'src/app/models/reviews.ce.json';

export enum DemoModel {
    Foursquare,
    Reviews,
    Evaluations
}

export class DemoModels {

    static getModel(model: DemoModel): Model {
        const extractions = DemoModels.getRawExtractions(model);
        const id = DemoModels.getId(model);
        return new Model(extractions, id);
    }

    static getRawExtractions(model: DemoModel): RawExtraction[] {
        switch (model) {
          case DemoModel.Foursquare: { return parseJson(foursquare); }
          case DemoModel.Reviews: { return parseJson(reviews); }
          case DemoModel.Evaluations: { return parseJson(evaluations); }
        }
        throw new Error('Tried to load invalid Demo Model!');
    }

    static getId(model: DemoModel): string {
        return DemoModel[model];
    }

    static get ids() {
        return Object.keys(DemoModel);
    }

    static isValidId(id: string) {
        return DemoModel[id] !== undefined;
    }

    static fromId(id: string, fallback: Model = null): Model {
        if (!DemoModels.isValidId(id)) {
            console.warn(`${id} is no valid id. returning fallback ${fallback}`)
            return fallback;
        }

        return DemoModels.getModel(DemoModel[id]);
    }

    constructor() {
        throw new Error(`${this.constructor.name} is a static helper class and cannot be instantiated.`);
    }
}
