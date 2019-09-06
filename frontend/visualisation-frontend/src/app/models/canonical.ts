import { mapToNumber, mapToSentiment, Sentiment, SentimentCount } from './sentiment';
import { sum, flatten } from './utils';

export interface StringMap<V> {
  [key: string]: V;
}

export type IdGenerator = () => string;

export class Facet {
  text = '';
  group = '';
}

export type FacetProperty = 'text' | 'group';

export type FacetType = 'attribute' | 'aspect';

export class FacetTypes {
  public static Attribute: FacetType = 'attribute';
  public static Aspect: FacetType = 'aspect';

  public static isFacetType(value: string): boolean {
    return value === 'attribute' || value === 'aspect';
  }

  public static other(type: FacetType) {
    return type === FacetTypes.Attribute ? FacetTypes.Aspect : FacetTypes.Attribute;
  }
}


export class RawExtraction {
  public comment = '';
  public aspect: Facet = new Facet();
  public attribute: Facet = new Facet();
  public sentiment: Sentiment = Sentiment.Unknown;
}

/**
 * A single opinion, expressed by some user.
 * Consists of the raw text, i.e. comment,
 * an aspect that the comment contains, a corresponding aspect
 * and sentiment.
 */
export class Extraction implements RawExtraction {
  public id = 'UNKNOWN';
  public comment = '';
  public aspect: Facet = new Facet();
  public attribute: Facet = new Facet();
  public sentiment: Sentiment = Sentiment.Unknown;

  public static fromRawExtraction(ex: RawExtraction, gen: IdGenerator) {
    const extraction = new Extraction();
    extraction.id = gen();
    extraction.comment = ex.comment;
    extraction.aspect = ex.aspect;
    extraction.attribute = ex.attribute;
    extraction.sentiment = ex.sentiment;
    return extraction;
  }
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
  values: mapToPropertyValues,
  toGroups: mapToExtractionGroups,
  toViewGroups: mapToViewExtractionGroups
};



export class ExtractionGroup {
  public readonly id: string;
  public readonly name: string;
  public readonly type: ExtractionProperty;
  public readonly extractions: Extraction[];
  public readonly sentimentCount: SentimentCount;

  constructor(id: string, name: string, type: ExtractionProperty, extractions: Extraction[], sentimentCount?: SentimentCount) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.extractions = extractions;
    this.sentimentCount = sentimentCount === undefined ? SentimentCount.fromExtractions(extractions) : sentimentCount;
  }
}

/**
 * ExtractionGroup that is only temporarily available and does not belong to the model.
 * Ids are not unique.
 */
export class ViewExtractionGroup implements ExtractionGroup {
  public readonly id = 'VIEW_EXTRACTION_GROUP';
  public readonly name: string;
  public readonly type: ExtractionProperty;
  public readonly extractions: Extraction[];
  public readonly sentimentCount: SentimentCount;

  constructor(name: string, type: ExtractionProperty, extractions: Extraction[]) {
    this.name = name;
    this.type = type;
    this.extractions = extractions;
    this.sentimentCount = SentimentCount.fromExtractions(this.extractions);
  }
}

export class NestedExtractionGroup implements ExtractionGroup {
  public readonly name: string;
  // TODO: Implement!
  public readonly type: ExtractionProperty;

  public get id(): string {
    return this._id;
  }

  public get extractions(): Extraction[] {
    if (this.members === null) {
      return this.original.extractions;
    }
    if (this._extractions === null) {
      this._extractions = this.memberExtractions.concat(this.original.extractions);
    }
    return this._extractions;
  }

  public get sentimentCount(): SentimentCount {
    if (this.members === null) {
      return this.original.sentimentCount;
    }
    if (this._sentimentCount === null) {
      this._sentimentCount = SentimentCount.fromExtractions(this.extractions);
    }
    return this._sentimentCount;
  }

  protected get memberExtractions(): Extraction[] {
    const extractions = this.members.map(group => group.extractions);
    return flatten(extractions);
  }


  /**
   * The ExtractionGroup at its initial state.
   */
  protected get original(): ExtractionGroup {
    return this._original;
  }

  protected _id: string;
  protected _extractions: Extraction[] = null;
  protected _sentimentCount: SentimentCount = null;
  protected _original: ExtractionGroup;

  /**
   * Contains all subgroups that were merged into this ExtractionGroup.
   */
  protected members: ExtractionGroup[] = null;

  constructor(id: string, name: string, type: ExtractionProperty, extractions: Extraction[], sentimentCount?: SentimentCount) {
    this.name = name;
    this._original = new ExtractionGroup(id, name, type, extractions, sentimentCount);
  }
}

// TODO: ExtractionGroups.pop, .strip, .remove, .reset

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

function toExtractionGroups(extractions: Extraction[], property: ExtractionProperty, idGenerator: IdGenerator): ExtractionGroup[] {
  const groupNameToExtractions = groupBy(extractions, property);
  const entries = Object.entries(groupNameToExtractions);
  const groups = entries.map(entry => {
    const name = entry[0];
    const exs = entry[1];
    return new ExtractionGroup(idGenerator(), name, property, exs);
  });
  return groups;
}

function toExtractionMap(groups: ExtractionGroup[]) {
  const names = groups.map(group => group.name);
  const map: StringMap<Extraction[]> = {};
  groups.forEach(group => map[group.name] = group.extractions);
  return map;
}

function toGroupMap(groups: ExtractionGroup[]): StringMap<ExtractionGroup> {
  const names = groups.map(group => group.name);
  const map: StringMap<ExtractionGroup> = {};
  groups.forEach(group => map[group.name] = group);
  return map;
}

function groupByFlat(extractions: Extraction[],
                     property: ExtractionProperty,
                     facetProperty: FacetProperty = 'group'): Extraction[][] {
  const groupMap = groupBy(extractions, property, facetProperty);
  return Object.values(groupMap);
}

function mapToExtractionGroups(
  idGenerator: () => string,
  extractions: Extraction[],
  property: ExtractionProperty,
  facetProperty: FacetProperty = 'group'
  ) {
  const groupMap = groupBy(extractions, property, facetProperty);
  return Object.entries(groupMap).map(entry => {
    const name = entry[0];
    const exs = entry[1];
    return new ExtractionGroup(idGenerator(), name, property, exs);
  });
}

function mapToViewExtractionGroups (
  extractions: Extraction[],
  property: ExtractionProperty,
  facetProperty: FacetProperty = 'group'
): ExtractionGroup[] {
  const groupMap = groupBy(extractions, property, facetProperty);
  return Object.entries(groupMap).map(entry => {
    const name = entry[0];
    const exs = entry[1];
    return new ViewExtractionGroup(name, property, exs);
  });
}


function makeIdGenerator() {
  let start = -1;
  return () => {
    start++;
    return start.toString()
  }
}

// TODO: move to sentiment?
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
  public readonly extractions: Extraction[];

  /**
   * A cache of group name to extraction maps for the model.
   */
  private nameToExtractions: {
    aspect: StringMap<Extraction[]>,
    attribute: StringMap<Extraction[]>,
    comment: StringMap<Extraction[]>,
    sentiment: StringMap<Extraction[]>
  };

  /**
   * A cache of group name to group maps for the model.
   */
  private nameToGroup: {
    aspect: StringMap<ExtractionGroup>,
    attribute: StringMap<ExtractionGroup>,
    comment: StringMap<ExtractionGroup>,
    sentiment: StringMap<ExtractionGroup>
  }

  /**
   * A cache of group lists for the model.
   */
  private groupLists: {
    aspect: ExtractionGroup[],
    attribute: ExtractionGroup[],
    comment: ExtractionGroup[],
    sentiment: ExtractionGroup[]
  };

  /**
   * Map of ids to corresponding Extraction.
   */
  private idToExtraction: Map<string, Extraction>;
  /**
   * Map of ids to corresponding ExtractionGroup.
   */
  private idToExtractionGroup: Map<string, ExtractionGroup>;

  private modelId: string;
  private idGenerator: () => string;

  constructor(extractions: RawExtraction[], id: string = 'custom') {
    // initialize properties
    this.modelId = id;
    this.idGenerator = makeIdGenerator();
    this.idToExtractionGroup = new Map();
    this.idToExtraction = new Map();
    this.nameToExtractions = { aspect: null, attribute: null, comment: null, sentiment: null };
    this.nameToGroup = { aspect: null, attribute: null, comment: null, sentiment: null };
    this.groupLists = { aspect: null, attribute: null, comment: null, sentiment: null };
    this.extractions = extractions.map(ex => Extraction.fromRawExtraction(ex, this.idGenerator));

    // populate id to extraction map
    for (const extraction of this.extractions) {
      this.idToExtraction.set(extraction.id, extraction)
    }

    // generate ExtractionGroups for each property
    const properties: ExtractionProperty[] = [ 'aspect', 'attribute', 'comment', 'sentiment' ]
    for (const property of  properties) {
      const groups = toExtractionGroups(this.extractions, property, this.idGenerator);
      const groupMap = toGroupMap(groups);
      const extractionMap = toExtractionMap(groups);
      this.groupLists[property] = groups;
      this.nameToExtractions[property] = extractionMap;
      this.nameToGroup[property] = groupMap;

      // populate id to extraction group map
      for (const group of groups) {
        this.idToExtractionGroup.set(group.id, group);
      }
    }
  }

  static fromRawExtractions(extractions: RawExtraction[]): Model {
    return new Model(extractions, 'custom');
  }

  static fromJson(json: any[]): Model {
    const extractions = parseJson(json);
    const id = 'custom_json_model';
    return new Model(extractions, id);
  }

  get id(): string {
    return this.modelId;
  }

  public getExtractionsByName(name: string, property: ExtractionProperty) {
    return this.nameToExtractions[property][name];
  }

  /**
   * Returns the Extraction associated with the given id.
   * Throws an error, if group does not exist.
   */
  public getExtractionById(id: string): Extraction {
    if (!this.idToExtraction.has(id)) {
      throw new Error(`Extraction with id ${id} does not exist!`);
    }
    return this.idToExtraction.get(id);
  }

  /**
   * Returns a list of all ExtractionGroups of the given ExtractionProperty in the model.
   */
  public getGroupsFor(property: ExtractionProperty): ExtractionGroup[] {
    return this.groupLists[property];
  }

  /**
   * Returns the ExtractionGroup for the given property.
   * @param name  The name of the group.
   * @param property  The ExtractionProperty to which the group belongs.
   * @return  The corresponding ExtractionGroup, empty ExtractionGroup if group does not exist.
   */
  public getGroupByName(name: string, property: ExtractionProperty): ExtractionGroup {
    const group = this.nameToGroup[property][name];
    return group !== undefined ? group : new ExtractionGroup('empty', name, property, []);
  }

  /**
   * Returns the ExtractionGroup associated with the given id.
   * Throws an error, if group does not exist.
   */
  public getGroupById(id: string): ExtractionGroup {
    if (!this.idToExtractionGroup.has(id)) {
      throw new Error(`Extraction with id ${id} does not exist!`);
    }
    return this.idToExtractionGroup.get(id);
  }
}

export function parseJson(json: any[]): RawExtraction[] {
  return json.map(toRawExtraction);
}

function toRawExtraction(json: any): RawExtraction {
  return {
    comment: json.comment,
    aspect: json.aspect,
    attribute: json.attribute,
    sentiment: mapToSentiment(json.sentiment)
  };
}
