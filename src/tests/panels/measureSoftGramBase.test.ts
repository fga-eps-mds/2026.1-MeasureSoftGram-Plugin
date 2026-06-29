import * as assert from 'assert';
import { MeasureSoftGramBase } from '../../panels/measureSoftGramBase';

function makeWebview() {
    const posted: any[] = [];
    return {
        posted,
        postMessage(msg: any) { posted.push(msg); },
        onDidReceiveMessage() {},
        cspSource: 'vscode-resource:',
        asWebviewUri: (u: any) => u,
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

function makeExtensionContext(overrides: Partial<{
    serviceUrl: string;
    productName: string;
    token: string;
}> = {}) {
    return {
        workspaceState: makeWorkspaceState({
            'msgram.serviceUrl':  overrides.serviceUrl  ?? 'https://msgram-api.synaptha.com/',
            'msgram.productName': overrides.productName ?? 'measuresoftgram 2026',
        }),
        secrets: makeSecrets(overrides.token ?? ''),
        extensionUri: { fsPath: '/ext' } as any,
        subscriptions: [],
    } as any;
}

function makeFetchRepositories(repos: any[] = [{ id: 1, name: 'repo-a' }]) {
    return async (_settings: any, _log?: any) => ({
        orgPk: 10,
        productPk: 20,
        repos,
    });
}

function makeFetchScoreForRepo(result: any = { score: 0.85, noData: false }) {
    return async () => result;
}

class TestableBase extends MeasureSoftGramBase {
    public webviewInstance = makeWebview();
    public loadStartCalled = false;
    public scoreLoadedData: any = null;
    public scoreErrorCalled = false;
    public reposEmptyCalled = false;

    constructor(ctx: any,
                public fetchRepos = makeFetchRepositories(),
                public fetchScore = makeFetchScoreForRepo()) {
        super(ctx);
    }

    protected get _webview() { return this.webviewInstance as any; }
    protected onLoadStart()           { this.loadStartCalled = true; }
    protected onScoreLoaded(d: any)   { this.scoreLoadedData = d; }
    protected onScoreError()          { this.scoreErrorCalled = true; }
    protected onReposEmpty()          { this.reposEmptyCalled = true; }

    public loadPersistedSettings()    { return this._loadPersistedSettings(); }
    public persistSettings(d: any)    { return this._persistSettings(d); }
    public loadReposAndScore(fr = this.fetchRepos, fs = this.fetchScore) {
        return this._loadReposAndScore(fr, fs);
    }
    public loadScoreForSelected(fs = this.fetchScore) {
        return this._loadScoreForSelected(fs);
    }
    public handleCommonMessage(msg: any, fr = this.fetchRepos, fs = this.fetchScore) {
        return this._handleCommonMessage(msg, fr, fs);
    }
    public getSettings() { return this._settings; }
    public getContext()  { return this._context; }
    public getSelectedRepo() { return this._selectedRepo; }
}

suite('MeasureSoftGramBase', () => {

    test('carrega as configurações persistidas corretamente', async () => {
        const ctx = makeExtensionContext({ serviceUrl: 'https://custom.com/', productName: 'my-product', token: 'tok123' });
        const base = new TestableBase(ctx);

        await base.loadPersistedSettings();

        assert.strictEqual(base.getSettings().serviceUrl,  'https://custom.com/');
        assert.strictEqual(base.getSettings().productName, 'my-product');
        assert.strictEqual(base.getSettings().token,       'tok123');
    });

    test('usa valores padrão quando não há configurações persistidas', async () => {
        const ctx = makeExtensionContext();
        const base = new TestableBase(ctx);

        await base.loadPersistedSettings();

        assert.strictEqual(base.getSettings().serviceUrl,  'https://msgram-api.synaptha.com/');
        assert.strictEqual(base.getSettings().productName, 'measuresoftgram 2026');
        assert.strictEqual(base.getSettings().token,       '');
    });

    test('persiste as configurações e atualiza o estado interno', async () => {
        const ctx = makeExtensionContext();
        const base = new TestableBase(ctx);

        await base.persistSettings({ serviceUrl: 'https://new.com/', msgramServiceToken: 'newtoken', productName: 'new-product' });

        assert.strictEqual(base.getSettings().serviceUrl,  'https://new.com/');
        assert.strictEqual(base.getSettings().productName, 'new-product');
        assert.strictEqual(base.getSettings().token,       'newtoken');
    });

    test('envia score_loading e repos_loaded ao carregar repositórios', async () => {
        const ctx = makeExtensionContext();
        const base = new TestableBase(ctx);

        await base.loadReposAndScore();

        const commands = base.webviewInstance.posted.map((m: any) => m.command);
        assert.ok(commands.includes('score_loading'));
        assert.ok(commands.includes('repos_loaded'));
    });

    test('chama onLoadStart ao iniciar carregamento', async () => {
        const base = new TestableBase(makeExtensionContext());

        await base.loadReposAndScore();

        assert.strictEqual(base.loadStartCalled, true);
    });

    test('seleciona o primeiro repositório automaticamente', async () => {
        const repos = [{ id: 1, name: 'repo-a' }, { id: 2, name: 'repo-b' }];
        const base = new TestableBase(makeExtensionContext(), makeFetchRepositories(repos));

        await base.loadReposAndScore();

        assert.strictEqual(base.getSelectedRepo()?.id, 1);
    });

    test('envia score_error e chama onReposEmpty quando não há repositórios', async () => {
        const base = new TestableBase(makeExtensionContext(), makeFetchRepositories([]));

        await base.loadReposAndScore();

        assert.strictEqual(base.reposEmptyCalled, true);
        const errorMsg = base.webviewInstance.posted.find((m: any) => m.command === 'score_error');
        assert.ok(errorMsg);
    });

    test('envia score_error e chama onScoreError quando fetchRepositories lança exceção', async () => {
        const failFetch = async () => { throw new Error('network failure'); };
        const base = new TestableBase(makeExtensionContext(), failFetch as any);

        await base.loadReposAndScore();

        assert.strictEqual(base.scoreErrorCalled, true);
        const errorMsg = base.webviewInstance.posted.find((m: any) => m.command === 'score_error');
        assert.strictEqual(errorMsg?.message, 'network failure');
    });

    test('envia score_loaded e chama onScoreLoaded com os dados do score', async () => {
        const scoreData = { score: 0.92, noData: false };
        const base = new TestableBase(makeExtensionContext(), makeFetchRepositories(), makeFetchScoreForRepo(scoreData));
        await base.loadReposAndScore();
        base.webviewInstance.posted.length = 0;

        await base.loadScoreForSelected();

        assert.deepStrictEqual(base.scoreLoadedData, scoreData);
        const loaded = base.webviewInstance.posted.find((m: any) => m.command === 'score_loaded');
        assert.ok(loaded);
    });

    test('envia score_error e chama onScoreError quando fetchScoreForRepo lança exceção', async () => {
        const failScore = async () => { throw new Error('score error'); };
        const base = new TestableBase(makeExtensionContext(), makeFetchRepositories(), failScore as any);
        await base.loadReposAndScore();

        base.scoreErrorCalled = false;
        await base.loadScoreForSelected(failScore as any);

        assert.strictEqual(base.scoreErrorCalled, true);
    });

    test('handleCommonMessage: request_score envia settings_loaded e carrega dados', async () => {
        const ctx = makeExtensionContext({ serviceUrl: 'https://test.com/' });
        const base = new TestableBase(ctx);

        const handled = await base.handleCommonMessage({ command: 'request_score' });

        assert.strictEqual(handled, true);
        const settingsMsg = base.webviewInstance.posted.find((m: any) => m.command === 'settings_loaded');
        assert.strictEqual(settingsMsg?.data.serviceUrl, 'https://test.com/');
    });

    test('handleCommonMessage: select_repo muda o repositório selecionado', async () => {
        const repos = [{ id: 1, name: 'repo-a' }, { id: 2, name: 'repo-b' }];
        const base = new TestableBase(makeExtensionContext(), makeFetchRepositories(repos));
        await base.loadReposAndScore();

        await base.handleCommonMessage({ command: 'select_repo', repoPk: 2 });

        assert.strictEqual(base.getSelectedRepo()?.id, 2);
    });

    test('handleCommonMessage: save_settings persiste dados e recarrega', async () => {
        const base = new TestableBase(makeExtensionContext());
        const data = { serviceUrl: 'https://saved.com/', msgramServiceToken: 'tk', productName: 'saved' };

        const handled = await base.handleCommonMessage({ command: 'save_settings', data });

        assert.strictEqual(handled, true);
        assert.strictEqual(base.getSettings().serviceUrl, 'https://saved.com/');
        const savedMsg = base.webviewInstance.posted.find((m: any) => m.command === 'settings_saved');
        assert.ok(savedMsg);
    });

    test('handleCommonMessage: retorna false para comandos desconhecidos', async () => {
        const base = new TestableBase(makeExtensionContext());

        const handled = await base.handleCommonMessage({ command: 'unknown_command' });

        assert.strictEqual(handled, false);
    });
});