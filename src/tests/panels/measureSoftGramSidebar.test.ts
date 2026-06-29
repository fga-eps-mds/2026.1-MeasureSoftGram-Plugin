import * as assert from 'assert';
import { MeasureSoftGramSidebar } from '../../panels/measureSoftGramSidebar';

function makeWebview() {
    const posted: any[] = [];
    let handler: ((msg: any) => void) | null = null;
    return {
        posted,
        options: {} as any,
        html: '',
        cspSource: 'vscode-resource:',
        asWebviewUri: (u: any) => u,
        postMessage(msg: any) { posted.push(msg); },
        onDidReceiveMessage(cb: (msg: any) => void) { handler = cb; return { dispose: () => {} }; },
        simulateMessage(msg: any) { handler?.(msg); },
    };
}

function makeWebviewView(webview = makeWebview()) {
    return { webview } as any;
}

function makeStatusBar() {
    return {
        loadingCalled:  false,
        errorCalled:    false,
        noDataCalled:   false,
        lastScore:      undefined as number | undefined,
        disposeCalled:  false,
        setLoading()          { this.loadingCalled = true; },
        setError()            { this.errorCalled = true; },
        setNoData()           { this.noDataCalled = true; },
        setScore(s: number)   { this.lastScore = s; },
        dispose()             { this.disposeCalled = true; },
    };
}

function makeSecrets(token = '') {
    const store: Record<string, string> = { 'msgram.token': token };
    return {
        get: async (k: string) => store[k],
        store: async (k: string, v: string) => { store[k] = v; },
        onDidChange: () => ({ dispose: () => {} }),
    };
}

function makeWorkspaceState(initial: Record<string, string> = {}) {
    const store: Record<string, string> = { ...initial };
    return {
        get: <T>(k: string, def: T) => (store[k] as any) ?? def,
        update: async (k: string, v: any) => { store[k] = v; },
        keys: () => Object.keys(store) as readonly string[],
        setKeysForSync: () => {},
    };
}

function makeExtensionContext(overrides: Partial<{ serviceUrl: string; productName: string }> = {}) {
    return {
        workspaceState: makeWorkspaceState({
            'msgram.serviceUrl':  overrides.serviceUrl  ?? 'https://msgram-api.synaptha.com/',
            'msgram.productName': overrides.productName ?? 'measuresoftgram 2026',
        }),
        secrets: makeSecrets(),
        extensionUri: { fsPath: '/ext', with: () => ({}) } as any,
        subscriptions: [],
    } as any;
}

function makeFetchRepositories(repos: any[] = [{ id: 1, name: 'repo-a' }]) {
    return async () => ({ orgPk: 10, productPk: 20, repos });
}

function makeFetchScoreForRepo(result: any = { score: 0.85, noData: false }) {
    return async () => result;
}

function makeWorkspaceFakes(workspacePath = '/workspace') {
    return {
        workspace: { workspaceFolders: [{ uri: { fsPath: workspacePath } }] },
        fs: { mkdir: async () => {}, writeFile: async () => {} },
    };
}

suite('MeasureSoftGramSidebar', () => {

    test('resolveWebviewView registra o listener de mensagens', () => {
        const ctx = makeExtensionContext();
        const sb = makeStatusBar();
        const sidebar = new MeasureSoftGramSidebar(ctx, sb as any);
        const wv = makeWebview();
        const view = makeWebviewView(wv);

        sidebar.resolveWebviewView(view);

        assert.ok(wv.html.includes('<div id="root">'));
    });

    test('request_score envia settings_loaded com a url correta', async () => {
        const ctx = makeExtensionContext({ serviceUrl: 'https://custom.com/' });
        const sidebar = new MeasureSoftGramSidebar(ctx, makeStatusBar() as any);
        const wv = makeWebview();
        sidebar.resolveWebviewView(makeWebviewView(wv));

        await sidebar.handleMessage(
            { command: 'request_score' },
            makeFetchRepositories(),
            makeFetchScoreForRepo(),
        );

        const msg = wv.posted.find((m: any) => m.command === 'settings_loaded');
        assert.strictEqual(msg?.data.serviceUrl, 'https://custom.com/');
    });

    test('request_score aciona setLoading na status bar', async () => {
        const ctx = makeExtensionContext();
        const sb = makeStatusBar();
        const sidebar = new MeasureSoftGramSidebar(ctx, sb as any);
        sidebar.resolveWebviewView(makeWebviewView(makeWebview()));

        await sidebar.handleMessage(
            { command: 'request_score' },
            makeFetchRepositories(),
            makeFetchScoreForRepo(),
        );

        assert.strictEqual(sb.loadingCalled, true);
    });

    test('score carregado atualiza status bar com o valor correto', async () => {
        const ctx = makeExtensionContext();
        const sb = makeStatusBar();
        const sidebar = new MeasureSoftGramSidebar(ctx, sb as any);
        sidebar.resolveWebviewView(makeWebviewView(makeWebview()));

        await sidebar.handleMessage(
            { command: 'request_score' },
            makeFetchRepositories(),
            makeFetchScoreForRepo({ score: 0.91, noData: false }),
        );

        assert.strictEqual(sb.lastScore, 0.91);
    });

    test('noData=true chama setNoData na status bar', async () => {
        const ctx = makeExtensionContext();
        const sb = makeStatusBar();
        const sidebar = new MeasureSoftGramSidebar(ctx, sb as any);
        sidebar.resolveWebviewView(makeWebviewView(makeWebview()));

        await sidebar.handleMessage(
            { command: 'request_score' },
            makeFetchRepositories(),
            makeFetchScoreForRepo({ score: 0, noData: true }),
        );

        assert.strictEqual(sb.noDataCalled, true);
    });

    test('erro no fetch chama setError na status bar', async () => {
        const ctx = makeExtensionContext();
        const sb = makeStatusBar();
        const sidebar = new MeasureSoftGramSidebar(ctx, sb as any);
        sidebar.resolveWebviewView(makeWebviewView(makeWebview()));
        const failFetch = async () => { throw new Error('fail'); };

        await sidebar.handleMessage(
            { command: 'request_score' },
            failFetch as any,
            makeFetchScoreForRepo(),
        );

        assert.strictEqual(sb.errorCalled, true);
    });

    test('select_repo muda o repositório selecionado e recarrega o score', async () => {
        const repos = [{ id: 1, name: 'repo-a' }, { id: 2, name: 'repo-b' }];
        const ctx = makeExtensionContext();
        const sb = makeStatusBar();
        const sidebar = new MeasureSoftGramSidebar(ctx, sb as any);
        const wv = makeWebview();
        sidebar.resolveWebviewView(makeWebviewView(wv));

        await sidebar.handleMessage({ command: 'request_score' }, makeFetchRepositories(repos), makeFetchScoreForRepo());
        wv.posted.length = 0;

        await sidebar.handleMessage({ command: 'select_repo', repoPk: 2 }, makeFetchRepositories(repos), makeFetchScoreForRepo());

        const loaded = wv.posted.find((m: any) => m.command === 'score_loaded');
        assert.ok(loaded);
    });

    test('save_settings persiste as configurações e envia settings_saved', async () => {
        const ctx = makeExtensionContext();
        const sidebar = new MeasureSoftGramSidebar(ctx, makeStatusBar() as any);
        const wv = makeWebview();
        sidebar.resolveWebviewView(makeWebviewView(wv));

        await sidebar.handleMessage(
            { command: 'save_settings', data: { serviceUrl: 'https://new.com/', msgramServiceToken: 'tk', productName: 'np' } },
            makeFetchRepositories(),
            makeFetchScoreForRepo(),
        );

        const msg = wv.posted.find((m: any) => m.command === 'settings_saved');
        assert.ok(msg);
    });

    test('save_action salva o arquivo yaml e envia action_saved', async () => {
        const ctx = makeExtensionContext();
        const sidebar = new MeasureSoftGramSidebar(ctx, makeStatusBar() as any);
        const wv = makeWebview();
        sidebar.resolveWebviewView(makeWebviewView(wv));
        const { workspace, fs } = makeWorkspaceFakes();

        await sidebar.handleMessage(
            { command: 'save_action', yaml: 'name: MeasureSoftGram' },
            makeFetchRepositories(),
            makeFetchScoreForRepo(),
            workspace as any,
            fs as any,
        );

        const msg = wv.posted.find((m: any) => m.command === 'action_saved');
        assert.ok(msg);
    });

    test('run_action abre terminal com comando docker', async () => {
        const ctx = makeExtensionContext();
        const sidebar = new MeasureSoftGramSidebar(ctx, makeStatusBar() as any);
        sidebar.resolveWebviewView(makeWebviewView(makeWebview()));
        const { workspace, fs } = makeWorkspaceFakes();
        const terminals: any[] = [];
        const fakeWindow = {
            createTerminal: (opts: any) => {
                const t = { ...opts, shown: false, sentText: '', show() { this.shown = true; }, sendText(s: string) { this.sentText = s; } };
                terminals.push(t);
                return t;
            },
            showErrorMessage: () => {},
        };

        await sidebar.handleMessage(
            { command: 'run_action', yaml: 'name: MeasureSoftGram' },
            makeFetchRepositories(),
            makeFetchScoreForRepo(),
            workspace as any,
            fs as any,
            fakeWindow as any,
        );

        assert.strictEqual(terminals.length, 1);
        assert.ok(terminals[0].sentText.includes('docker compose'));
        assert.strictEqual(terminals[0].shown, true);
    });

    test('run_action sem workspace mostra mensagem de erro', async () => {
        const ctx = makeExtensionContext();
        const sidebar = new MeasureSoftGramSidebar(ctx, makeStatusBar() as any);
        sidebar.resolveWebviewView(makeWebviewView(makeWebview()));
        let errorShown = '';
        const fakeWindow = {
            createTerminal: () => ({ show: () => {}, sendText: () => {} }),
            showErrorMessage: (msg: string) => { errorShown = msg; },
        };
        const emptyWorkspace = { workspaceFolders: undefined };

        await sidebar.handleMessage(
            { command: 'run_action', yaml: 'name: test' },
            makeFetchRepositories(),
            makeFetchScoreForRepo(),
            emptyWorkspace as any,
            { mkdir: async () => {}, writeFile: async () => {} } as any,
            fakeWindow as any,
        );

        assert.ok(errorShown.length > 0);
    });
});