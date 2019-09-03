import { SortOption, SortOptions, SortOrderOption, SortOrderOptions } from 'src/app/components/filters/sort-filter/sort';

/** The default `Storage` to use for `StateManagers` */
export const DefaultStorage: Storage = sessionStorage;

/** Generates a storage key for the given identifiers by joining them. */
function makeStorageKey(...identifiers: string[]) {
  const prefix = 'cv';
  const seperator = '_';
  const key = [prefix, ...identifiers]
    .join(seperator)
    .replace(/ /g, seperator);
  return key;
}

/**
 * Class for managing the state of Objects of type `T` using a storage.
 */
export class StateManager<T> {
  /** The key under which the state object is stored. */
  readonly StorageKey: string;

  /** The default value to be returned, when `loadSafe` fails. */
  readonly DefaultValue: T;

  protected _storage: Storage;
  protected _state: T;

  /**
   * Transformation function that deserializes the stored string into a valid state object.\
   * Defaults to `JSON.parse`.
   */
  public deserializer: (stored: string) => T = JSON.parse;

  /**
   * Transformation function that serializes state object to string.\
   * Defaults to `JSON.stringify`.
   */
  public serializer: (state: T) => string = JSON.stringify;

  /**
   * Indicates whether the storage should be updated automatically, when a new state is set. \
   * Defaults to `true`.
   */
  public saveOnSet = true;

  constructor(storageKey: string, defaultValue: T, storage: Storage) {
    this._storage = storage;
    this.StorageKey = storageKey;
    this.DefaultValue = Object.freeze(defaultValue);
  }

  /** The current state object. */
  get state(): T { return this._state; }
  set state(state: T) {
    this._state = state;
    if (this.saveOnSet) {
      this.save();
    }
  }

  /** Reads the state object stored under the `StorageKey`. */
  read(): T {
    const stored = this._storage.getItem(this.StorageKey);
    return this.deserializer(stored);
  }

  /**
   * Tries to read the state object stored under the `StorageKey`.
   * Returns `null` if reading fails.
   */
  readSafe(): T {
    try {
      return this.read();
    } catch (error) {
      console.error(error);
      console.warn('reading failed, returning null');
      return null;
    }
  }

  /** Reads the state object stored under the `StorageKey` and sets the new state. */
  load() {
    this.state = this.read();
  }

  /**
   * Reads the state object stored under the `StorageKey` and sets the new state.\
   * Returns `DefaultValue`, if reading fails.
   */
  loadSafe(fallBack = this.DefaultValue) {
    const state = this.readSafe();
    this.state = state !== null ? state : fallBack;
  }

  /** Saves the current state in the storage. */
  save() {
    this._storage.setItem(this.StorageKey, this.serializer(this.state));
  }
}

// TODO: move to sort.ts
export interface SortState {
  order: SortOrderOption;
  sort: SortOption;
}

export interface SortOptionRegistry {
  [identifier: string]: SortOption;
}

/**
 * Returns a function to deserialize string representations of a `SortState`, using the given `SortOptionRegistry`.
 * A deserializer is required since functions cannot be serialized.
 * The returned deserializer tries to find an appropriate sortFunction in the given registry.
 */
function makeSortStateDeserializer(registry: SortOptionRegistry): (sortState: string) => SortState {
  const deserializer = (sortState: string) => {
    const state: SortState = JSON.parse(sortState); // does not have a sortFunction yet
    const identifier = state.sort.value;
    const sortOption = registry[identifier];

    // throw error, if identifier is not in the registry
    if (sortOption === undefined) {
      throw new Error(`could not retrieve SortOption from registry.\n found invalid identifier '${identifier}' in storage.`);
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
    const key = makeStorageKey('sort');
    const defaultValue = {
      order: SortOrderOptions.descending,
      sort: SortOptions.options.noSort
    };
    super(key, defaultValue, DefaultStorage);
    this.SortOptionRegistry = Object.freeze(registry);
    this.deserializer = makeSortStateDeserializer(this.SortOptionRegistry);
  }

  /** The current sort order option of the sort state. */
  get order(): SortOrderOption { return this.state.order; }
  set order(order: SortOrderOption) {
    this.state = { order, sort: this._state.sort };
  }

  /** The current sort option of the sort state. */
  get sort(): SortOption { return this.state.sort; }
  set sort(sort: SortOption) {
    this.state = { order: this._state.order, sort };
  }
}
