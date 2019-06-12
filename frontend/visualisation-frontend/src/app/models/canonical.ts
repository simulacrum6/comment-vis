import {Sentiment, mapToSentiment, SentimentCount} from './sentiment';

export interface StringMap<V> {
  [key: string]: V;
}

export class Facet {
  text: '';
  group: '';
}

export type FacetProperty = 'text' | 'group';
export type FacetType = 'attribute' | 'aspect';

export class Extraction {
  comment = '';
  aspect: Facet = new Facet();
  attribute: Facet = new Facet();
  sentiment: Sentiment = Sentiment.Unknown;
}

export type ExtractionProperty = 'comment' | 'aspect' | 'attribute' | 'sentiment';

/**
 * Utility functions for handling lists of Extractions.
 */
export const Extractions = {
  groupBy,
  groupByFlat,
  values: mapToPropertyValues
};

/**
 * A function, mapping an extraction to one of its property values.
 */
export type PropertyMapper = (e: Extraction) => string;

/**
 * Returns a PropertyMapper, based on the given property.
 */
function getPropertyMapper(property: ExtractionProperty, facetProperty: FacetProperty = 'group'): PropertyMapper {
  if (property === 'aspect' || property === 'attribute') {
    return NestedMapper;
  }
  return SimpleMapper;

  function SimpleMapper(extraction: Extraction): string {
    return extraction[property] as string;
  }

  function NestedMapper(extraction: Extraction): string {
    return extraction[property][facetProperty];
  }
}

/**
 * Maps a given collection of extractions to the values of the specified properties.
 * If no mapping function is provided, it is automatically inferred from the parameters.
 * @param extractions the extractions to be mapped
 * @param property the property which should be used in the mapping
 * @param facetProperty (optional) determines whether 'group' or 'text' should be mapped for facet properties, defaults to 'group'.
 * @param mapper (optional) the mapping function to be used
 */
function mapToPropertyValues(extractions: Extraction[],
                             property: ExtractionProperty,
                             facetProperty: FacetProperty = 'group',
                             mapper?: PropertyMapper): string[] {
  mapper = mapper ? mapper : getPropertyMapper(property, facetProperty);
  return extractions.map(mapper);
}

function groupBy(extractions: Extraction[],
                 property: ExtractionProperty,
                 facetProperty: FacetProperty = 'group'): StringMap<Extraction[]> {
  const extractor = getPropertyMapper(property, facetProperty);
  const keys = new Set(extractions.map(extractor)); // set of all property values

  // initialize map with empty array
  const groups: StringMap<Extraction[]> = {};
  keys.forEach(key => groups[key] = []);

  for (const extraction of extractions) {
    const extractedProperty = extractor(extraction);
    groups[extractedProperty].push(extraction);
  }

  return groups;
}

function groupByFlat(extractions: Extraction[],
                     property: ExtractionProperty,
                     facetProperty: FacetProperty = 'group'): Extraction[][] {
  const groupMap = groupBy(extractions, property, facetProperty);
  return Object.keys(groupMap).map(key => groupMap[key]);
}

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
