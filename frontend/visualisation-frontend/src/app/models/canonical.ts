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

export class FacetTypes {
  public static Attribute: FacetType = 'attribute';
  public static Aspect: FacetType = 'aspect';

  public static other(type: FacetType) {
    return type === FacetTypes.Attribute ? FacetTypes.Aspect : FacetTypes.Attribute;
  }
}

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
type PropertyMapper = (e: Extraction) => string;

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

export class ExtractionGroup {
  public readonly name: string;
  public readonly extractions: Extraction[];
  public readonly sentimentCount: SentimentCount;

  constructor(name: string, extractions: Extraction[]) {
    this.name = name;
    this.extractions = extractions;
    this.sentimentCount = SentimentCount.fromExtractions(extractions);
  }
}

export class Model {

  /**
   * A cache of group maps for the model.
   */
  private groupMaps: {
    aspect: StringMap<Extraction[]>,
    attribute: StringMap<Extraction[]>,
    comment: StringMap<Extraction[]>,
    sentiment: StringMap<Extraction[]>
  };

  /**
   * A cache of group lists for the model.
   */
  private groupLists: {
    aspect: ExtractionGroup[],
    attribute: ExtractionGroup[],
    comment: ExtractionGroup[],
    sentiment: ExtractionGroup[]
  };

  constructor(public readonly extractions: Extraction[]) {
    this.groupMaps = { aspect: null, attribute: null, comment: null, sentiment: null };
    this.groupLists = { aspect: null, attribute: null, comment: null, sentiment: null };
  }

  get aspects(): Facet[] {
    return this.extractions.map(extraction => extraction.aspect);
  }

  get attributes(): Facet[] {
    return this.extractions.map(extraction => extraction.attribute);
  }

  get comments(): string[] {
    return this.extractions.map(extraction => extraction.comment);
  }

  get sentiments(): Sentiment[] {
    return this.extractions.map(extraction => extraction.sentiment);
  }

  /**
   * Returns a map of the given ExtractionProperty Groups to its Extractions.
   */
  public getGroupMap(property: ExtractionProperty): StringMap<Extraction[]> {
    if (this.groupMaps[property] === null) {
      this.groupMaps[property] = Extractions.groupBy(this.extractions, property);
    }

    return this.groupMaps[property];
  }

  /**
   * Returns a map of all aspect group names to their Extractions.
   */
  get aspectGroupMap(): StringMap<Extraction[]> {
    return this.getGroupMap('aspect');
  }

  /**
   * Returns a map of all attribute group names to their Extractions.
   */
  get attributeGroupMap(): StringMap<Extraction[]> {
    return this.getGroupMap('attribute');
  }

  /**
   * Returns a list of all ExtractionGroups of the given ExtractionProperty in the model.
   */
  public getGroupList(property: ExtractionProperty): ExtractionGroup[] {
    if (this.groupLists[property] === null) {
      this.groupLists[property] = Object.entries(this.getGroupMap(property))
        .map(entry => new ExtractionGroup(...entry));
    }

    return this.groupLists[property];
  }

  /**
   * Returns a list of all Aspect ExtractionGroups in the model.
   */
  get aspectGroupList(): ExtractionGroup[] {
    return this.getGroupList('aspect');
  }

  /**
   * Returns a list of all Attribute ExtractionGroups in the model.
   */
  get attributeGroupList(): ExtractionGroup[] {
    return this.getGroupList('attribute');
  }

  /**
   * Returns the ExtractionGroup for the given property.
   * @param name  The name of the group.
   * @param property  The ExtractionProperty to which the group belongs.
   * @return  The corresponding ExtractionGroup, empty ExtractionGroup if group does not exist.
   */
  public getGroup(name: string, property: ExtractionProperty): ExtractionGroup {
    const extractions = this.getGroupMap(property)[name];

    if (extractions === undefined) {
      return new ExtractionGroup(name, []);
    }

    return new ExtractionGroup(name, extractions);
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
