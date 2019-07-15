import { Sentiment, mapToSentiment, SentimentCount, mapToNumber } from './sentiment';
import { sum } from './utils';

export interface StringMap<V> {
  [key: string]: V;
}

export class Facet {
  text: string = '';
  group: string = '';
}

export type FacetProperty = 'text' | 'group';
export type FacetType = 'attribute' | 'aspect';

/**
 * A single opinion, expressed by some user.
 * Consists of the raw text, i.e. comment,
 * an aspect that the comment contains, a corresponding aspect
 * and sentiment.
 */
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
  /**
   * Groups the given list of `Extractions` by one of its properties.
   * Returns a mapping from property values to a list of `Extractions`.
   *
   * @param extractions the extractions to be grouped.
   * @param property the property to group by.
   * @param facetProperty _(optional)_ the `FacetProperty` to group by, if `property` refers to a Facet.
   * @return a mapping from property value to a list of Extractions.
   */
  groupBy,
  /**
   * Groups a list of extractions by some property.
   * Returns the extracted groups as a list of lists.
   * Each entry in the list represents a group
   *
   * @see groupBy;
   */
  groupByFlat,
  /**
   * Maps a given list of extractions to the values of the specified properties.
   * If no mapping function is provided, it is automatically inferred from the parameters.
   * @param extractions the extractions to be mapped
   * @param property the property which should be used in the mapping
   * @param facetProperty _(optional)_ determines whether 'group' or 'text' should be mapped for facet properties, defaults to 'group'.
   * @param mapper _(optional)_ the mapping function to be used
   */
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
  return Object.values(groupMap);
}

/**
 * Calculates the difference in Sentiment for the given extractions.
 */
export function sentimentDifferential(extractions: Extraction[], normalized: boolean = true): number {
  const differential = extractions
    .map(extraction => extraction.sentiment)
    .map(mapToNumber)
    .reduce(sum);
  return normalized ? differential / extractions.length : differential;
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
