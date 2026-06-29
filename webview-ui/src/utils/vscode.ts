import type {VSCodeAPI} from '../types';

let _api: VSCodeAPI | null = null;

export function getVSCodeAPI(): VSCodeAPI {
    if (!_api) {
        _api = acquireVsCodeApi();
    }
    return _api;
}