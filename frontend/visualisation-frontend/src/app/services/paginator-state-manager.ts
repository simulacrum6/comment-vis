import { PaginatorConfig } from '../models/utils';
import { StateManager } from './state-manager';

const DefaultPaginatorConfig: PaginatorConfig = {
    pageSizes: [25, 35, 50, 75, 150],
    pageSize: 35,
    pageIndex: 0,
    length: 0,
}

export class PaginatorStateManager extends StateManager<PaginatorConfig> implements PaginatorConfig {

    get pageSizes(): number[] {
        return this.state.pageSizes;
    }
    set pageSizes(pageSizes: number[]) {
        this.state = {...this._state, pageSizes };
    }

    get pageSize(): number {
        return this.state.pageSize;
    }
    set pageSize(pageSize: number) {
        this.state = {...this._state, pageSize };
    }

    get pageIndex(): number {
        return this.state.pageIndex;
    }
    set pageIndex(pageIndex: number) {
        this.state = {...this._state, pageIndex };
    }

    get length(): number {
        return this.state.length;
    }
    set length(length: number) {
        this.state = {...this._state, length };
    }

    constructor(paginatorName: string) {
        super(paginatorName, {...DefaultPaginatorConfig});
    }
}
