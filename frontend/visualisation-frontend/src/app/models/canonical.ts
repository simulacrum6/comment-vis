import { mapToNumber, mapToSentiment, Sentiment, SentimentCount } from './sentiment';
import { flatten, sum } from './utils';

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
   * Same as groupBy, but returns a list of [name, extractions] tuples.
   * @see groupBy
   */
  groupAsEntries,
  /**
   * Maps a given list of extractions to the values of the specified properties.
   * If no mapping function is provided, it is automatically inferred from the parameters.
   * @param extractions the extractions to be mapped
   * @param property the property which should be used in the mapping
   * @param facetProperty _(optional)_ determines whether 'group' or 'text' should be mapped for facet properties, defaults to 'group'.
   * @param mapper _(optional)_ the mapping function to be used
   */
  values: mapToPropertyValues,
  toViewGroups: mapToViewExtractionGroups
};

export interface ExtractionGroup {
  readonly id: string;
  readonly name: string;
  readonly type: ExtractionProperty;
  readonly extractions: Extraction[];
  readonly sentimentCount: SentimentCount;
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
  public readonly id: string;
  public readonly name: string;
  public readonly type: ExtractionProperty;

  public get extractions(): Extraction[] {
    if (!this.hasMembers) {
      return this.original.extractions;
    }
    return this.memberExtractions.concat(this.original.extractions);
  }

  public get sentimentCount(): SentimentCount {
    if (!this.hasMembers) {
      return this.original.sentimentCount;
    }
    return SentimentCount.fromExtractions(this.extractions);
  }

  protected readonly original: ExtractionGroup;
  protected members: NestedExtractionGroup[] = null;

  protected get hasMembers(): boolean {
    return this.members !== null || this.members === [];
  }

  protected get memberExtractions(): Extraction[] {
    const extractions = this.members.map(group => group.extractions);
    return flatten(extractions);
  }

  constructor(id: string, name: string, type: ExtractionProperty, extractions: Extraction[], sentimentCount?: SentimentCount) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.original = { id, name, type, extractions, sentimentCount };
  }

  /**
   * Adds other ExtractionGroup to this one's members.
   */
  public add(other: NestedExtractionGroup) {
    if (!this.hasMembers) {
      this.members = [];
    }
    this.members.push(other);
  }

  /**
   * Removes other member ExtractionGroup.
   */
  public remove(other: NestedExtractionGroup) {
    const error = new Error(`Member to remove is not in Group!`);
    if (!this.hasMembers) {
      throw error;
    }
    const index = this.members.findIndex(group => group.id === other.id);
    if (index === -1) {
      throw error;
    }
    this.members.splice(index, 1);
  }
}

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

function groupAsEntries(
  extractions: Extraction[],
  property: ExtractionProperty,
  facetProperty: FacetProperty = 'group')
  : [string, Extraction[]][] {
  return Object.entries(groupBy(extractions, property, facetProperty));
}

function groupByFlat(extractions: Extraction[], property: ExtractionProperty, facetProperty: FacetProperty = 'group'): Extraction[][] {
const groupMap = groupBy(extractions, property, facetProperty);
return Object.values(groupMap);
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
  public get id(): string {
    return this.modelId;
  }

  /**
   * Group name to group maps for the model.
   * Used to retrieve groups by name and type.
   */
  private nameToGroup: {
    aspect: StringMap<NestedExtractionGroup>,
    attribute: StringMap<NestedExtractionGroup>,
    comment: StringMap<NestedExtractionGroup>,
    sentiment: StringMap<NestedExtractionGroup>
  }

  /**
   * Group lists for each ExtractionProperty.
   * This one is updated, whenever groups are merged or split.
   */
  private groupLists: {
    aspect: NestedExtractionGroup[],
    attribute: NestedExtractionGroup[],
    comment: NestedExtractionGroup[],
    sentiment: NestedExtractionGroup[],
  }

  /**
   * Map of ids to corresponding Extraction.
   */
  private idToExtraction: Map<string, Extraction>;

  /**
   * Map of ids to corresponding ExtractionGroup.
   */
  private idToExtractionGroup: Map<string, NestedExtractionGroup>;

  private modelId: string;
  private idGenerator: IdGenerator;

  constructor(extractions: RawExtraction[], id: string = 'custom') {
    // initialize properties
    this.modelId = id;
    this.idGenerator = makeIdGenerator();
    this.idToExtractionGroup = new Map();
    this.idToExtraction = new Map();
    this.nameToGroup = { aspect: null, attribute: null, comment: null, sentiment: null };
    this.groupLists = { aspect: null, attribute: null, comment: null, sentiment: null };
    this.extractions = extractions.map(ex => Extraction.fromRawExtraction(ex, this.idGenerator));

    // populate id to extraction map
    for (const extraction of this.extractions) {
      this.idToExtraction.set(extraction.id, extraction);
    }

    // generate ExtractionGroups for each property
    const properties: ExtractionProperty[] = [ 'aspect', 'attribute', 'comment', 'sentiment' ]
    for (const property of  properties) {
      const groups = this.makeExtractionGroups(this.extractions, property);
      const groupMap = Model.toGroupMap(groups);
      this.nameToGroup[property] = groupMap;
      this.groupLists[property] = groups;

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

  private static toGroupMap(groups: NestedExtractionGroup[]): StringMap<NestedExtractionGroup> {
    const map: StringMap<NestedExtractionGroup> = {};
    groups.forEach(group => map[group.name] = group);
    return map;
  }

  private makeExtractionGroups(extractions: Extraction[], property: ExtractionProperty): NestedExtractionGroup[] {
    const groupNameToExtractions = groupBy(extractions, property);
    const entries = Object.entries(groupNameToExtractions);
    const groups = entries.map(entry => {
      const name = entry[0];
      const exs = entry[1];
      return new NestedExtractionGroup(this.idGenerator(), name, property, exs);
    });
    return groups;
  }

  public groupIsInModel(id: string): boolean {
    return this.idToExtractionGroup.has(id);
  }

  public getExtractionsByName(name: string, property: ExtractionProperty): Extraction[] {
    return this.nameToGroup[property][name].extractions;
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
    if (group === undefined) {
      throw new Error(`Group of type '${property}' and name '${name}' does not exist!`);
    }
    return group;
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

  /**
   * Returns the subgroups for the given extraction group.
   * @param group  The group to get subgroups for.
   * @param type   The type of the subgroups to get.
   * @return  A list of ExtractionGroups.
   */
  public getSubGroups(group: ExtractionGroup, type: ExtractionProperty): ViewExtractionGroup[] {
    return Extractions.groupAsEntries(group.extractions, type)
      .map(([name, extractions]) => new ViewExtractionGroup(name, type, extractions));
  }

  /**
   * Returns the subgroups for the given extraction group.
   * @param group  The group to get subgroups for.
   * @param type   The type of the subgroups to get.
   * @return  A list of ExtractionGroups.
   */
  public getSubGroupsById(id: string, type: ExtractionProperty): ViewExtractionGroup[] {
    const group = this.getGroupById(id);
    return this.getSubGroups(group, type);
  }

  /**
   * Merges the other group into the given group and updates the model accordingly.
   * Returns the updated list of ExtractionGroups.
   */
  public merge(group: ExtractionGroup, other: ExtractionGroup): ExtractionGroup[] {
    const nestedGroup = this.getNestedGroup(group.id);
    const nestedOther = this.getNestedGroup(other.id);
    this.add(nestedGroup, nestedOther);
    return this.groupLists[group.type];
  }

  /**
   * Merges the other group into the given group and updates the model accordingly.
   * Returns the updated list of ExtractionGroups.
   */
  public mergeById(groupId: string, otherId: string): ExtractionGroup[] {
    const nestedGroup = this.getNestedGroup(groupId);
    const nestedOther = this.getNestedGroup(otherId);
    this.add(nestedGroup, nestedOther);
    return this.groupLists[nestedGroup.type];
  }

  protected getNestedGroup(id: string): NestedExtractionGroup {
    return this.getGroupById(id) as NestedExtractionGroup;
  }

  protected add(group: NestedExtractionGroup, other: NestedExtractionGroup) {
    group.add(other);
    // remove other from list
    const list = this.groupLists[group.type];
    this.groupLists[group.type] = list.filter(g => g.id !== other.id);
  }

  /**
   * Splits the other group off of the given group.
   */
  public split(group: ExtractionGroup, other: ExtractionGroup) {
    const nestedGroup = this.getNestedGroup(group.id);
    const nestedOther = this.getNestedGroup(other.id);
    this.remove(nestedGroup, nestedOther);
    return this.groupLists[group.type];
  }

  /**
   * Splits the other group off of the given group.
   */
  public splitById(groupId: string, otherId: string) {
    const nestedGroup = this.getNestedGroup(groupId);
    const nestedOther = this.getNestedGroup(otherId);
    this.remove(nestedGroup, nestedOther);
    return this.groupLists[nestedGroup.type];
  }

  protected remove(group: NestedExtractionGroup, other: NestedExtractionGroup) {
    try {
      group.remove(other);
    } catch (e) {
      console.warn(e);
      console.warn('Model was not changed.');
      return this.groupLists[group.type];
    }
    const list = this.groupLists[group.type];
    this.groupLists[group.type] = list.concat(other);
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
