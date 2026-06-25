import { OutputChannel, Uri, Webview, WebviewView, WebviewViewProvider, window, workspace } from 'vscode';
import { getNonce, getUri } from '../utilities/utilities';
import { fetchRepositories, fetchScoreForRepo, MsgramSettings, RepoContext, RepoItem } from '../services/msgramApi';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKFLOW_REL_PATH = '.github/workflows/msgram.yml';

export class MeasureSoftGramSidebar implements WebviewViewProvider {
  public static readonly viewType = 'msgram.sidebarView';
  private _view?: WebviewView;
  private _settings: MsgramSettings = { serviceUrl: '', token: '', productName: '' };
  private readonly _log: OutputChannel = window.createOutputChannel('MeasureSoftGram API');
  private _context: RepoContext | null = null;
  private _selectedRepo: RepoItem | null = null;

  constructor(private readonly _extensionUri: Uri) {}

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        Uri.joinPath(this._extensionUri, 'out'),
        Uri.joinPath(this._extensionUri, 'webview-ui/build'),
      ],
    };

    webviewView.webview.html = this._getWebviewContent(
      webviewView.webview,
      this._extensionUri,
    );

    this._setWebviewMessageListener(webviewView.webview);
  }

  private logger() {
    return (msg: string) => this._log.appendLine(msg);
  }

  private async _loadReposAndScore() {
    if (!this._view) { return; }
    const webview = this._view.webview;

    this._log.show(true);
    webview.postMessage({ command: 'score_loading' });

    try {
      this._context = await fetchRepositories(this._settings, this.logger());
      const repos = this._context.repos;

      webview.postMessage({ command: 'repos_loaded', repos });

      if (!repos.length) {
        webview.postMessage({ command: 'score_error', message: 'Nenhum repositório encontrado.' });
        return;
      }

      this._selectedRepo = repos[0];
      await this._loadScoreForSelected();
    } catch (err: any) {
      const msg = err.message ?? 'Erro ao buscar repositórios.';
      this._log.appendLine(`[ERRO] ${msg}`);
      webview.postMessage({ command: 'score_error', message: msg });
    }
  }

  private async _loadScoreForSelected() {
    if (!this._view || !this._context || !this._selectedRepo) { return; }
    const webview = this._view.webview;

    webview.postMessage({ command: 'score_loading' });
    try {
      const data = await fetchScoreForRepo(
        this._settings,
        this._context.orgPk,
        this._context.productPk,
        this._selectedRepo.id,
        this._selectedRepo.name,
        this.logger(),
      );
      webview.postMessage({ command: 'score_loaded', data });
    } catch (err: any) {
      const msg = err.message ?? 'Erro ao buscar métricas.';
      this._log.appendLine(`[ERRO] ${msg}`);
      webview.postMessage({ command: 'score_error', message: msg });
    }
  }

  private async _saveWorkflowFile(yaml: string): Promise<string> {
    const folder = workspace.workspaceFolders?.[0];
    if (!folder) {
      throw new Error('Abra uma pasta/workspace antes de salvar o workflow.');
    }

    const workspacePath = folder.uri.fsPath;
    const workflowAbsPath = path.join(workspacePath, WORKFLOW_REL_PATH);

    await fs.mkdir(path.dirname(workflowAbsPath), { recursive: true });
    await fs.writeFile(workflowAbsPath, yaml, 'utf-8');

    return workspacePath;
  }

  private async _runAction(yaml: string) {
    let workspacePath: string;
    try {
      workspacePath = await this._saveWorkflowFile(yaml);
    } catch (err) {
      window.showErrorMessage(`${err}`);
      return;
    }

    const dockerDir = Uri.joinPath(this._extensionUri, 'resources', 'docker').fsPath;

    const terminal = window.createTerminal({
      name: 'MeasureSoftGram · Act',
      cwd: dockerDir,
      env: {
        WORKSPACE_PATH: workspacePath,
        WORKFLOW_REL_PATH: WORKFLOW_REL_PATH,
      },
    });

    terminal.show();
    terminal.sendText('docker compose up --build --abort-on-container-exit');
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
          await this._loadReposAndScore();
          break;

        case 'select_repo': {
          if (!this._context) { break; }
          const repo = this._context.repos.find(r => r.id === message.repoPk);
          if (repo) {
            this._selectedRepo = repo;
            await this._loadScoreForSelected();
          }
          break;
        }

        case 'save_settings':
          this._settings = message.data as MsgramSettings;
          this._context = null;
          this._selectedRepo = null;
          webview.postMessage({ command: 'settings_saved' });
          await this._loadReposAndScore();
          break;

        case 'save_action': {
          try {
            await this._saveWorkflowFile(message.yaml);
            webview.postMessage({ command: 'action_saved' });
          } catch (err) {
            window.showErrorMessage(`Não foi possível salvar o workflow: ${err}`);
          }
          break;
        }

        case 'run_action':
          this._runAction(message.yaml);
          break;
      }
    });
  }
}
