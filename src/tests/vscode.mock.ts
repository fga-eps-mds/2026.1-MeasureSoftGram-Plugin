/**
 * Mock do módulo 'vscode' para testes com Mocha fora do runtime do VSCode.
 * O tsc compila para out/tests/vscode.mock.js, que o .mocharc.cjs carrega via --require.
 */

const Module = require('module');

const vscode = {
    ViewColumn: { One: 1, Two: 2, Three: 3 },
    StatusBarAlignment: { Left: 1, Right: 2 },

    Uri: {
        joinPath: (...args: any[]) => ({
            fsPath: args.map((a: any) => (typeof a === 'string' ? a : a.fsPath)).join('/'),
        }),
        parse: (s: string) => ({ fsPath: s, toString: () => s }),
        file: (p: string) => ({ fsPath: p }),
    },

    ThemeColor: class ThemeColor {
        constructor(public id: string) {}
    },

    window: {
        createStatusBarItem: (_alignment: any, _priority: number) => ({
            command: undefined as any,
            tooltip: undefined as any,
            text: undefined as any,
            color: undefined as any,
            backgroundColor: undefined as any,
            show() {},
            hide() {},
            dispose() {},
        }),
        createOutputChannel: (_name: string) => ({
            appendLine: () => {},
            show: () => {},
            dispose: () => {},
        }),
        createWebviewPanel: () => {
            throw new Error('vscode.window.createWebviewPanel não mockado — injete via parâmetro');
        },
        createTerminal: () => {
            throw new Error('vscode.window.createTerminal não mockado — injete via parâmetro');
        },
        showErrorMessage: () => Promise.resolve(undefined),
        showInformationMessage: () => Promise.resolve(undefined),
    },

    workspace: {
        workspaceFolders: undefined as any,
    },

    EventEmitter: class EventEmitter {
        private _listeners: Array<(data: any) => void> = [];
        event = (listener: (data: any) => void) => {
            this._listeners.push(listener);
            return { dispose: () => {} };
        };
        fire(data: any) { this._listeners.forEach(l => l(data)); }
        dispose() {}
    },

    Disposable: class Disposable {
        constructor(private _fn?: () => void) {}
        dispose() { this._fn?.(); }
        static from(...disposables: Array<{ dispose(): void }>) {
            return new vscode.Disposable(() => disposables.forEach(d => d.dispose()));
        }
    },
};

require.cache['vscode'] = {
    id: 'vscode',
    filename: 'vscode',
    loaded: true,
    exports: vscode,
    paths: [],
    children: [],
    parent: null,
} as any;

const _originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request: string, ...rest: any[]) {
    if (request === 'vscode') { return 'vscode'; }
    return _originalResolve.call(this, request, ...rest);
};

module.exports = vscode;
