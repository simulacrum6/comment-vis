import {Sentiment, mapToSentiment, SentimentCount} from './sentiment';

export interface StringMap<V> {
  [key: string]: V;
}

export const StringMap = function StringMapConstructor<V>(keys: Set<string>, initValue: V): StringMap<V> {
  const map: StringMap<V> = {};
  keys.forEach(key => map[key] = initValue); // broken with reference datatypes
  return map;
};

export class Facet {
  text: '';
  group: '';
}

export class Extraction {
  comment = '';
  aspect: Facet = new Facet();
  attribute: Facet = new Facet();
  sentiment: Sentiment = Sentiment.Unknown;
}

export const Extractions = {
  groupBy
};

function groupBy(extractions: Extraction[], property: 'comment' | 'aspect' | 'attribute' | 'sentiment',
                 subProperty: 'text' | 'group' = 'group'): StringMap<Extraction[]> {
  const extractor = getPropertyExtractor();
  const keys = new Set(extractions.map(extractor)); // set of all property values

  // initialize map with empty array
  const groups: StringMap<Extraction[]> = {};
  keys.forEach(key => groups[key] = []);

  for (const extraction of extractions) {
    const extractedProperty = extractor(extraction);
    groups[extractedProperty].push(extraction);
  }

  return groups;

  function getPropertyExtractor(): (e: Extraction) => string {
    if (property === 'aspect' || property === 'attribute') {
      return getNested;
    }
    return getSimple;

    function getSimple(extraction: Extraction): string {
      return extraction[property] as string;
    }

    function getNested(extraction: Extraction): string {
      return extraction[property][subProperty];
    }
  }
}

export const Extraction = function ExtractionConstructor(): Extraction {
  return {
    comment: '',
    aspect: {text: '', group: ''},
    attribute: {text: '', group: ''},
    sentiment: Sentiment.Unknown
  };
};

export class Model {
  constructor(private extractions: Extraction[]) {
  }

  get rawExtractions(): Extraction[] {
    return this.extractions;
  }

  get rawAspects(): Facet[] {
    return this.extractions.map(extraction => extraction.aspect);
  }

  get rawAttributes(): Facet[] {
    return this.extractions.map(extraction => extraction.attribute);
  }

  get rawComments(): string[] {
    return this.extractions.map(extraction => extraction.comment);
  }

  get rawSentiments(): Sentiment[] {
    return this.extractions.map(extraction => extraction.sentiment);
  }

  get aspectGroupMap(): StringMap<Extraction[]> {
    return Extractions.groupBy(this.extractions, 'aspect');
  }

  get attributeGroupMap(): StringMap<Extraction[]> {
    return Extractions.groupBy(this.extractions, 'attribute');
  }

  get aspectGroups(): Extraction[][] {
    const groupMap = this.aspectGroupMap;
    return Object.keys(groupMap).map(key => groupMap[key]);
  }

  get attributeGroups(): Extraction[][] {
    const groupMap = this.attributeGroupMap;
    return Object.keys(groupMap).map(key => groupMap[key]);
  }
}

export function parseJson(json: any[]): Extraction[] {
  return json.map(toExtraction);
}

function toExtraction(json: any): Extraction {
  return {
    comment: json.comment,
    aspect: json.aspect,
    attribute: json.attribute,
    sentiment: mapToSentiment(json.sentiment)
  };
}
