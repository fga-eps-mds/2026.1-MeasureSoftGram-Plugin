import { Disposable, ExtensionContext, Uri, ViewColumn, Webview, WebviewPanel, window } from 'vscode';
import { getNonce, getUri } from '../utilities/utilities';
import { fetchRepositories, fetchScoreForRepo, MsgramSettings, RepoContext, RepoItem } from '../services/msgramApi';

const KEY_SERVICE_URL   = 'msgram.serviceUrl';
const KEY_PRODUCT_NAME  = 'msgram.productName';
const SECRET_TOKEN      = 'msgram.token';

export class MeasureSoftGramPanel {
  public static currentPanel: MeasureSoftGramPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private _settings: MsgramSettings = {
    serviceUrl: 'https://msgram-api.synaptha.com/',
    token: '',
    productName: 'measuresoftgram 2026',
  };
  private _context: RepoContext | null = null;
  private _selectedRepo: RepoItem | null = null;

  private constructor(panel: WebviewPanel, private readonly _extensionContext: ExtensionContext) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, _extensionContext.extensionUri);
    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionContext: ExtensionContext) {
    if (MeasureSoftGramPanel.currentPanel) {
      MeasureSoftGramPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        'MeasureSoftGramView',
        'MeasureSoftGram',
        ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            Uri.joinPath(extensionContext.extensionUri, 'out'),
            Uri.joinPath(extensionContext.extensionUri, 'webview-ui/build'),
          ],
        },
      );
      MeasureSoftGramPanel.currentPanel = new MeasureSoftGramPanel(panel, extensionContext);
    }
  }

  public dispose() {
    MeasureSoftGramPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) { disposable.dispose(); }
    }
  }

  private async _loadPersistedSettings(): Promise<void> {
    const ctx = this._extensionContext;
    const serviceUrl  = ctx.workspaceState.get<string>(KEY_SERVICE_URL,  'https://msgram-api.synaptha.com/');
    const productName = ctx.workspaceState.get<string>(KEY_PRODUCT_NAME, 'measuresoftgram 2026');
    const token       = (await ctx.secrets.get(SECRET_TOKEN)) ?? '';
    this._settings = { serviceUrl, token, productName };
  }

  private async _persistSettings(data: { serviceUrl: string; msgramServiceToken: string; productName: string }): Promise<void> {
    const ctx = this._extensionContext;
    await ctx.workspaceState.update(KEY_SERVICE_URL,  data.serviceUrl);
    await ctx.workspaceState.update(KEY_PRODUCT_NAME, data.productName);
    await ctx.secrets.store(SECRET_TOKEN, data.msgramServiceToken);
    this._settings = {
      serviceUrl:  data.serviceUrl,
      token:       data.msgramServiceToken,
      productName: data.productName,
    };
  }

  private async _loadReposAndScore() {
    const webview = this._panel.webview;
    webview.postMessage({ command: 'score_loading' });
    try {
      this._context = await fetchRepositories(this._settings);
      const repos = this._context.repos;
      webview.postMessage({ command: 'repos_loaded', repos });
      if (!repos.length) {
        webview.postMessage({ command: 'score_error', message: 'Nenhum repositório encontrado.' });
        return;
      }
      this._selectedRepo = repos[0];
      await this._loadScoreForSelected();
    } catch (err: any) {
      webview.postMessage({ command: 'score_error', message: err.message ?? 'Erro ao buscar repositórios.' });
    }
  }

  private async _loadScoreForSelected() {
    if (!this._context || !this._selectedRepo) { return; }
    const webview = this._panel.webview;
    webview.postMessage({ command: 'score_loading' });
    try {
      const data = await fetchScoreForRepo(
        this._settings,
        this._context.orgPk,
        this._context.productPk,
        this._selectedRepo.id,
        this._selectedRepo.name,
      );
      webview.postMessage({ command: 'score_loaded', data });
    } catch (err: any) {
      webview.postMessage({ command: 'score_error', message: err.message ?? 'Erro ao buscar métricas.' });
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const stylesUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.css']);
    const scriptUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.js']);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
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

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(async (message: any) => {
      switch (message.command) {
        case 'request_score':
          await this._loadPersistedSettings();
          webview.postMessage({
            command: 'settings_loaded',
            data: {
              serviceUrl:  this._settings.serviceUrl,
              productName: this._settings.productName,
            },
          });
          await this._loadReposAndScore();
          break;

        case 'select_repo': {
          if (!this._context) { break; }
          const repo = this._context.repos.find((r: RepoItem) => r.id === message.repoPk);
          if (repo) {
            this._selectedRepo = repo;
            await this._loadScoreForSelected();
          }
          break;
        }

        case 'save_settings':
          await this._persistSettings(message.data);
          this._context = null;
          this._selectedRepo = null;
          webview.postMessage({ command: 'settings_saved' });
          webview.postMessage({
            command: 'settings_loaded',
            data: {
              serviceUrl:  this._settings.serviceUrl,
              productName: this._settings.productName,
            },
          });
          await this._loadReposAndScore();
          break;
      }
    }, undefined, this._disposables);
  }
}
