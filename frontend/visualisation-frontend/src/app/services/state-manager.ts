import { SortOption, SortOptions, SortOrderOption, SortOrderOptions, SortState } from 'src/app/components/filters/sort-filter/sort';
import { Model, parseJson, Extraction, DemoModel } from '../models/canonical';

/**
 * The default `Storage` to use for `StateManagers`
 */
export const DefaultStorage: Storage = sessionStorage;

/**
 * Generates a storage key for the given identifiers by joining them.
 */
function makeStorageKey(...identifiers: string[]) {
  const prefix = 'cv';
  const seperator = '_';
  const key = [prefix, ...identifiers]
    .join(seperator)
    .replace(/ /g, seperator);
  return key;
}

/**
 * Class for managing the state of Objects of type `T` using a storage.\
 *
 * The State Manager's storage key is used to identify the stored state object and retrieve it from storage.
 *
 * For serialization and deserialization, the functions `serializer` and `deserializer` are used.
 * `JSON.stringify` and `JSON.parse` are used per default.\
 * More complex objects may not be serializable in this way.
 * In this case, the State Manager must receive different serializer and deserializer functions to enable successful serialization.
 */
export class StateManager<T> {


  protected _defaultValue: T;
  protected _storageKey: string;
  protected _storage: Storage;
  protected _state: T;
  protected _isSaved: boolean;

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
   * If true the storage is updated automatically whenever a new state is set. \
   * Defaults to `true`.
   */
  public saveOnSet = true;


  /**
   * The key under which the state object is stored.
   */
  get storageKey(): string {
    return this._storageKey;
  };

  /**
   * The default value to be returned, when `loadSafe` fails.
   */
  get defaultValue(): T {
    return this._defaultValue;
  }

  /**
   * The current state object.
   */
  get state(): T { return this._state; }
  set state(state: T) {
    this._state = state;
    this._isSaved = false;
    if (this.saveOnSet) {
      this.save();
    }
  }

  /**
   * Indicates whether a valid state object is available.
   */
  get hasState(): boolean {
    const current = this.state;
    return (current !== null && current !== undefined);
  }

  /**
   * Indicates whether the current state object was stored.
   */
  get isSaved(): boolean {
    return this._isSaved;
  }


  /**
   * Constructs a new `StateManager`.
   * @param name  the name of the manager.
   * @param defaultValue  the defaultValue to return, when `loadSafe` fails.
   * @param storage  the storage to use.
   * @param loadAfter  If true `safeLoad` is called after construction.
   */
  constructor(name: string, defaultValue: T, storage: Storage = DefaultStorage, loadAfter: boolean = false) {
    this._storage = storage;
    this._storageKey = makeStorageKey(name);
    this._defaultValue = Object.freeze(defaultValue);
    this._isSaved = false;
    if (loadAfter) {
      this.loadSafe();
    }
  }

  /**
   * Reads the state object stored under the `StorageKey`.
   */
  read(): T {
    const stored = this._storage.getItem(this.storageKey);
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

  /**
   * Reads the state object stored under the `StorageKey` and sets the new state.
   */
  load() {
    this.state = this.read();
  }

  /**
   * Reads the state object stored under the `StorageKey` and sets the new state.\
   * Returns `DefaultValue`, if reading fails.
   */
  loadSafe(fallBack = this.defaultValue) {
    const state = this.readSafe();
    this.state = state !== null ? state : fallBack;
  }

  /**
   * Saves the current state in the storage.
   */
  save() {
    this._storage.setItem(this.storageKey, this.serializer(this.state));
    this._isSaved = true;
  }
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

export class ModelStateManager extends StateManager<Model> {

  private _modelId;

  get modelId(): string {
    return this.state.id;
  }

  get model(): Model {
    return this.state;
  }

  constructor(name = 'model_id', defaultValue = null, storage: Storage = DefaultStorage) {
    super(name, defaultValue, storage);
    this.deserializer = this.readFromId;
    this.serializer = (state: Model) => this.modelId;
    this._defaultValue = Model.fromDemo(DemoModel.Foursquare);
  }

  readFromId(id: string): Model {
    // load demo model if demo model was stored.
    const demoModel = DemoModel[id];

    // check if custom model.
    if (demoModel === undefined) {
      return this.readCustomModelFromId(id);
    }

    return Model.fromDemo(demoModel);
  }

  /**
   * Tries to read a custom model using the given id.\
   * Throws an error if reading fails.
   */
  readCustomModelFromId(id: string): Model {
    throw new Error(`Could not load model with id ${id}. Custom model loading not implemented yet.`)
  }
}
