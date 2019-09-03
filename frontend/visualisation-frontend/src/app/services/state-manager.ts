import { SortOrderOption, SortOption, SortOptions, SortOrderOptions } from 'src/app/components/filters/sort-filter/sort';

export class StateManager<T> {
  readonly StorageKey: string;
  readonly DefaultValue: T;
  protected _storage: Storage;
  protected _state: T;
  constructor(storageKey: string, defaultValue: T, storage: Storage) {
    this._storage = storage;
    this.StorageKey = storageKey;
    this.DefaultValue = Object.freeze(defaultValue);
  }
  get state(): T { return this._state; }
  set state(state: T) {
    this._state = state;
    this.save();
  }
  read(): T {
    const stored = this._storage.getItem(this.StorageKey);
    return JSON.parse(stored);
  }
  load() {
    this.state = this.read();
    return this.state;
  }
  loadSafe(fallBack = this.DefaultValue) {
    const state = this.read();
    return state !== null ? state : fallBack;
  }
  save() {
    this._storage.setItem(this.StorageKey, JSON.stringify(this.state));
  }
}


export const DefaultStorage: Storage = sessionStorage;

function makeStorageKey(...identifiers: string[]) {
  const prefix = 'cv';
  const seperator = '_';
  const key = [prefix, ...identifiers]
    .join(seperator)
    .replace(/ /g, seperator);
  return key;
}

export interface SortState {
  order: SortOrderOption;
  sort: SortOption;
}

export class SortStateManager extends StateManager<SortState> {
  readonly SortoptionRegistry: { [identifier: string]: SortOption };

  constructor(validSortOptions: { [identifier: string]: SortOption } = SortOptions.options) {
    const key = makeStorageKey('sort');
    const defaultValue = {
      order: SortOrderOptions.descending,
      sort: SortOptions.options.noSort
    };
    super(key, defaultValue, DefaultStorage);
    this.SortoptionRegistry = Object.freeze(validSortOptions);
  }

  get order(): SortOrderOption { return this.state.order; }
  set order(order: SortOrderOption) {
    this.state = { order, sort: this._state.sort };
  }

  get sort(): SortOption { return this.state.sort; }
  set sort(sort: SortOption) {
    this.state = { order: this._state.order, sort };
  }

  read(): SortState {
    const state = super.read();

    // try to retrieve SortOption from registry
    const identifier = state.sort.value;
    state.sort = this.SortoptionRegistry[identifier];

    // throw error, if SortOption cannot be retrieved.
    if (state.sort === undefined) {
      throw new Error(`could not retrieve SortOption from registry. invalid identifier ${identifier} in storage.`);
    }

    return state;
  }
}
