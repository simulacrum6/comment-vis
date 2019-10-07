import UUID from 'uuid4';
import { ExtractionGroup, IdGenerator } from '../models/canonical';

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
  IdEquals = 'id_equals'
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
  public static idEquals(groupId: string, id: string = FilterGenerator.id()): FilterOption {
    const name = DefaultFilterName.IdEquals;
    const filter = (group: ExtractionGroup) => group.id === groupId;
    return new FilterOption(id, name, groupId, filter);
  }
  public static generate(filter: string, value: any, id: string = FilterGenerator.id()): FilterOption {
    if (!FilterGenerator.registry.has(filter)) {
      throw new Error(`Filter with name '${filter}' is not available.`);
    }
    const generator = FilterGenerator.registry.get(filter);
    return generator(value, id);
  }
}
