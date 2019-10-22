import UUID from 'uuid4';
import { ExtractionGroup, IdGenerator, sentimentDifferential } from '../models/canonical';

export type Filter = (group: ExtractionGroup) => boolean;
export type FilterType = 'shun' | 'keep';

export class FilterOption {
  constructor(
    public id: string,
    public name: string,
    public value: any,
    public filterFunction: Filter
  ) { }
}

export enum DefaultFilterName {
  StartsWith = 'starts_with',
  IdEquals = 'id_equals',
  MoreThan = 'more_than',
  LessThan = 'less_than',
  OverallPositive = 'Overall Positive',
  OverallNegative = 'Overall Negative',
  CompletelyPositive = 'Completely Positive',
  CompletelyNegative = 'Completely Negative'
}

export class FilterGenerator {
  public static readonly id: IdGenerator = UUID;
  /**
   * Maps available filter names to their generator functions.
   */
  public static get registry(): Map<string, (value: any, id?: string) => FilterOption> {
    if (this._registry === undefined) {
      this._registry = new Map();
      this.registry.set(DefaultFilterName.StartsWith, FilterGenerator.startsWith);
      this.registry.set(DefaultFilterName.IdEquals, FilterGenerator.idEquals);
      this.registry.set(DefaultFilterName.MoreThan + '_x_mentions', FilterGenerator.moreThanXMentions);
      this.registry.set(DefaultFilterName.LessThan + '_x_mentions', FilterGenerator.lessThanXMentions);
      this.registry.set(DefaultFilterName.OverallPositive, FilterGenerator.overallPositive);
      this.registry.set(DefaultFilterName.OverallNegative, FilterGenerator.overallNegative);
      this.registry.set(DefaultFilterName.CompletelyPositive, FilterGenerator.completelyPositive);
      this.registry.set(DefaultFilterName.CompletelyNegative, FilterGenerator.completelyNegative);
    }
    return this._registry;
  }
  /**
   * Returns the names of the available filters.
   * Only filters in this list can be used with the `generate` function.
   */
  public static get availableFilters(): string[] {
    return Array.from(this.registry.keys());
  }

  private static _registry: Map<string, (value: any) => FilterOption>;

  public static startsWith(start: string, id: string = FilterGenerator.id()): FilterOption {
    const name = DefaultFilterName.StartsWith;
    const filter = (group: ExtractionGroup) => group.name.startsWith(start);
    return new FilterOption(id, name, start, filter);
  }
  public static idEquals(value: ExtractionGroup, id: string = FilterGenerator.id()): FilterOption {
    const name = DefaultFilterName.IdEquals;
    const filter = (group: ExtractionGroup) => group.id === value.id;
    return new FilterOption(id, name, value, filter);
  }
  public static moreThanXMentions(x = 1, id: string = FilterGenerator.id()) {
    const name = DefaultFilterName.MoreThan + '_x_mentions';
    const filter = (group: ExtractionGroup) => group.extractions.length > x;
    return new FilterOption(id, name, x, filter);
  }
  public static lessThanXMentions(x = 1, id: string = FilterGenerator.id()) {
    const name = DefaultFilterName.LessThan + '_x_mentions';
    const filter = (group: ExtractionGroup) => group.extractions.length < x;
    return new FilterOption(id, name, x, filter);
  }
  public static overallPositive(id: string = FilterGenerator.id()) {
    const name = DefaultFilterName.OverallPositive;
    const filter = (group: ExtractionGroup) => sentimentDifferential(group.extractions) > 0;
    return new FilterOption(id, name, 'positive', filter);
  }
  public static overallNegative(id: string = FilterGenerator.id()) {
    const name = DefaultFilterName.OverallNegative;
    const filter = (group: ExtractionGroup) => sentimentDifferential(group.extractions) < 0;
    return new FilterOption(id, name, 'negative', filter);
  }
  public static completelyPositive(id: string = FilterGenerator.id()) {
    const name = DefaultFilterName.CompletelyPositive;
    const filter = (group: ExtractionGroup) => sentimentDifferential(group.extractions) === 1;
    return new FilterOption(id, name, 'positive', filter);
  }
  public static completelyNegative(id: string = FilterGenerator.id()) {
    const name = DefaultFilterName.CompletelyNegative;
    const filter = (group: ExtractionGroup) => sentimentDifferential(group.extractions) === -1;
    return new FilterOption(id, name, 'negative', filter);
  }
  public static generate(filter: string, value: any, id: string = FilterGenerator.id()): FilterOption {
    if (!FilterGenerator.registry.has(filter)) {
      throw new Error(`Filter with name '${filter}' is not available.`);
    }
    const generator = FilterGenerator.registry.get(filter);
    return generator(value, id);
  }
}

export const FilterOptions = {
  groups: {
    topics: [
      FilterGenerator.moreThanXMentions(1),
    ],
    sentiment: [
      FilterGenerator.overallNegative(),
      FilterGenerator.completelyNegative(),
      FilterGenerator.overallPositive(),
      FilterGenerator.completelyPositive(),
    ]
  }
}
