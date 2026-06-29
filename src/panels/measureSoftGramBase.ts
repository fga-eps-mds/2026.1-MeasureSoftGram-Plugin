import {ExtensionContext, Uri, Webview} from 'vscode';
import {getNonce, getUri} from '../utilities/utilities';
import {
    fetchGrafanaDashboard as defaultFetchGrafanaDashboard,
    fetchGrafanaDashboards as defaultFetchGrafanaDashboards,
    fetchRepositories as defaultFetchRepositories,
    fetchScoreForRepo as defaultFetchScoreForRepo,
    MsgramSettings,
    RepoContext,
    RepoItem,
} from '../services/msgramApi';

export type FetchRepositoriesFn = typeof defaultFetchRepositories;
export type FetchScoreForRepoFn = typeof defaultFetchScoreForRepo;

export const KEY_SERVICE_URL = 'msgram.serviceUrl';
export const KEY_PRODUCT_NAME = 'msgram.productName';
export const SECRET_TOKEN = 'msgram.token';

export const DEFAULT_SETTINGS: MsgramSettings = {
    serviceUrl: 'https://msgram-api.synaptha.com/',
    token: '',
    productName: 'measuresoftgram 2026',
};

export abstract class MeasureSoftGramBase {
    protected _settings: MsgramSettings = {...DEFAULT_SETTINGS};
    protected _context: RepoContext | null = null;
    protected _selectedRepo: RepoItem | null = null;

    constructor(protected readonly _extensionContext: ExtensionContext) {
    }

    protected abstract get _webview(): Webview | undefined;

    protected onScoreLoaded(_data: any): void {
    }

    protected onScoreError(): void {
    }

    protected onReposEmpty(): void {
    }

    protected onLoadStart(): void {
    }

    protected logger(): ((msg: string) => void) | undefined {
        return undefined;
    }

    protected async _loadPersistedSettings(): Promise<void> {
        const ctx = this._extensionContext;
        const serviceUrl = ctx.workspaceState.get<string>(KEY_SERVICE_URL, DEFAULT_SETTINGS.serviceUrl);
        const productName = ctx.workspaceState.get<string>(KEY_PRODUCT_NAME, DEFAULT_SETTINGS.productName);
        const token = (await ctx.secrets.get(SECRET_TOKEN)) ?? '';
        this._settings = {serviceUrl, token, productName};
    }

    protected async _persistSettings(data: {
        serviceUrl: string;
        msgramServiceToken: string;
        productName: string;
    }): Promise<void> {
        const ctx = this._extensionContext;
        await ctx.workspaceState.update(KEY_SERVICE_URL, data.serviceUrl);
        await ctx.workspaceState.update(KEY_PRODUCT_NAME, data.productName);
        await ctx.secrets.store(SECRET_TOKEN, data.msgramServiceToken);
        this._settings = {
            serviceUrl: data.serviceUrl,
            token: data.msgramServiceToken,
            productName: data.productName,
        };
    }

    protected async _loadReposAndScore(
        fetchRepos: FetchRepositoriesFn = defaultFetchRepositories,
        fetchScore: FetchScoreForRepoFn = defaultFetchScoreForRepo,
    ): Promise<void> {
        const webview = this._webview;
        if (!webview) {
            return;
        }

        this.onLoadStart();
        webview.postMessage({command: 'score_loading'});

        try {
            this._context = await fetchRepos(this._settings, this.logger());
            const repos = this._context.repos;
            webview.postMessage({command: 'repos_loaded', repos});

            if (!repos.length) {
                this.onReposEmpty();
                webview.postMessage({command: 'score_error', message: 'Nenhum repositório encontrado.'});
                return;
            }

            this._selectedRepo = repos[0];
            await this._loadScoreForSelected(fetchScore);
        } catch (err: any) {
            const msg = err.message ?? 'Erro ao buscar repositórios.';
            this.logger()?.(`[ERRO] ${msg}`);
            this.onScoreError();
            webview.postMessage({command: 'score_error', message: msg});
        }
    }

    protected async _loadScoreForSelected(
        fetchScore: FetchScoreForRepoFn = defaultFetchScoreForRepo,
    ): Promise<void> {
        const webview = this._webview;
        if (!webview || !this._context || !this._selectedRepo) {
            return;
        }

        this.onLoadStart();
        webview.postMessage({command: 'score_loading'});

        try {
            const data = await fetchScore(
                this._settings,
                this._context.orgPk,
                this._context.productPk,
                this._selectedRepo.id,
                this._selectedRepo.name,
                this.logger(),
            );
            this.onScoreLoaded(data);
            webview.postMessage({command: 'score_loaded', data});
        } catch (err: any) {
            const msg = err.message ?? 'Erro ao buscar métricas.';
            this.logger()?.(`[ERRO] ${msg}`);
            this.onScoreError();
            webview.postMessage({command: 'score_error', message: msg});
        }
    }

    protected _getWebviewContent(webview: Webview, extensionUri: Uri): string {
        const stylesUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.css']);
        const scriptUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.js']);
        const nonce = getNonce();

        return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; frame-src http: https:;">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>MeasureSoftGram</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
    }

    protected async _handleCommonMessage(
        message: any,
        fetchRepos: FetchRepositoriesFn = defaultFetchRepositories,
        fetchScore: FetchScoreForRepoFn = defaultFetchScoreForRepo,
    ): Promise<boolean> {
        const webview = this._webview;
        if (!webview) {
            return false;
        }

        switch (message.command) {
            case 'request_score':
                await this._loadPersistedSettings();
                webview.postMessage({
                    command: 'settings_loaded',
                    data: {
                        serviceUrl: this._settings.serviceUrl,
                        productName: this._settings.productName,
                    },
                });
                await this._loadReposAndScore(fetchRepos, fetchScore);
                return true;

            case 'select_repo': {
                if (!this._context) {
                    return true;
                }
                const repo = this._context.repos.find((r: RepoItem) => r.id === message.repoPk);
                if (repo) {
                    this._selectedRepo = repo;
                    await this._loadScoreForSelected(fetchScore);
                }
                return true;
            }

            case 'save_settings':
                await this._persistSettings(message.data);
                this._context = null;
                this._selectedRepo = null;
                webview.postMessage({command: 'settings_saved'});
                await this._loadReposAndScore(fetchRepos, fetchScore);
                return true;

            case 'request_grafana_dashboards':
                await this._loadGrafanaDashboards();
                return true;

            case 'request_grafana_dashboard':
                await this._loadGrafanaDashboardUrl(message.uid);
                return true;

            default:
                return false;
        }
    }

    private async _loadGrafanaDashboards(): Promise<void> {
        const webview = this._webview;
        if (!webview) { return; }
        webview.postMessage({command: 'grafana_loading'});
        try {
            const dashboards = await defaultFetchGrafanaDashboards(this._settings, this.logger());
            webview.postMessage({command: 'grafana_dashboards_loaded', dashboards});
        } catch (err: any) {
            webview.postMessage({command: 'grafana_error', message: err.message ?? 'Erro ao buscar dashboards do Grafana.'});
        }
    }

    private async _loadGrafanaDashboardUrl(uid: string): Promise<void> {
        const webview = this._webview;
        if (!webview || !this._context) { return; }
        webview.postMessage({command: 'grafana_loading'});
        try {
            const detail = await defaultFetchGrafanaDashboard(
                this._settings,
                uid,
                this._context.productPk,
                this._selectedRepo?.id,
                this.logger(),
            );
            webview.postMessage({command: 'grafana_dashboard_loaded', url: detail.grafana_url, title: detail.title});
        } catch (err: any) {
            webview.postMessage({command: 'grafana_error', message: err.message ?? 'Erro ao buscar dashboard do Grafana.'});
        }
    }
}