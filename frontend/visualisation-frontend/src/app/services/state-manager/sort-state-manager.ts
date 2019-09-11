import { SortOption, SortOptionRegistry, SortOptions, SortOrderOption, SortOrderOptions, SortState } from 'src/app/components/controls/filters/sort-filter/sort';
import { DefaultStorage, StateManager } from './state-manager';

/**
 * Returns a function to deserialize string representations of a `SortState`, using the given `SortOptionRegistry`.
 * A deserializer is required since functions cannot be serialized.
 * The returned deserializer tries to find an appropriate sortFunction in the given registry.
 */
export function makeSortStateDeserializer(registry: SortOptionRegistry): (sortState: string) => SortState {
  const deserializer = (sortState: string) => {
    const state: SortState = JSON.parse(sortState); // does not have a sortFunction yet
    const identifier = state ? state.sort.value : undefined;
    const sortOption = registry[identifier];

    // throw error, if identifier is not in the registry
    if (sortOption === undefined) {
      throw new Error(`Could not retrieve SortOption from registry.\n Found invalid identifier '${identifier}' in storage.`);
    }

    // build valid SortState from retrieved sortOption
    return { order: state.order, sort: sortOption };
  };

  return deserializer;
}

export class SortStateManager extends StateManager<SortState> {
  /**
   * A mapping from string identifiers to `SortOption`s.
   * Used to retrieve the correct sortFunction when reading from the `Storage`.
   */
  readonly SortOptionRegistry: SortOptionRegistry;
  /**
   * Creates a new SortStateManager.
   * @param registry  the registry to use for looking up sortOptions. Defaults to `SororderOptions`.
   */
  constructor(registry: SortOptionRegistry = SortOptions.options) {
    const key = 'sort';
    const defaultValue = {
      order: SortOrderOptions.descending,
      sort: SortOptions.options.noSort
    };
    super(key, defaultValue, DefaultStorage);
    this.SortOptionRegistry = Object.freeze(registry);
    this.deserializer = makeSortStateDeserializer(this.SortOptionRegistry);
  }

  /**
   * The current sort order option of the sort state.
   */
  get order(): SortOrderOption { return this.state.order; }
  set order(order: SortOrderOption) {
    this.state = { order, sort: this._state.sort };
  }

  /**
   * The current sort option of the sort state.
   */
  get sort(): SortOption { return this.state.sort; }
  set sort(sort: SortOption) {
    this.state = { order: this._state.order, sort };
  }
}
