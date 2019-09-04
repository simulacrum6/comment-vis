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
  }

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
