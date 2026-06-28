import {
  ExtensionContext,
  OutputChannel,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  window,
  workspace,
} from 'vscode';
import {FetchRepositoriesFn, FetchScoreForRepoFn, MeasureSoftGramBase} from './measureSoftGramBase';
import {MsgramStatusBar} from '../statusbar/msgramStatusBar';
import * as defaultFs from 'fs/promises';
import * as path from 'path';

const WORKFLOW_REL_PATH = '.github/workflows/msgram.yml';

export interface SidebarActionDeps {
  workspace: { workspaceFolders: typeof workspace.workspaceFolders };
  fs: { mkdir: typeof defaultFs.mkdir; writeFile: typeof defaultFs.writeFile };
  window: { createTerminal: typeof window.createTerminal; showErrorMessage: typeof window.showErrorMessage };
}

const defaultActionDeps: SidebarActionDeps = {
  workspace,
  fs: {mkdir: defaultFs.mkdir, writeFile: defaultFs.writeFile},
  window: {createTerminal: window.createTerminal.bind(window), showErrorMessage: window.showErrorMessage.bind(window)},
};

export class MeasureSoftGramSidebar extends MeasureSoftGramBase implements WebviewViewProvider {
  public static readonly viewType = 'msgram.sidebarView';

  private _view?: WebviewView;
  private readonly _log: OutputChannel = window.createOutputChannel('MeasureSoftGram API');
  private readonly _statusBar: MsgramStatusBar;

  constructor(extensionContext: ExtensionContext, statusBar: MsgramStatusBar) {
    super(extensionContext);
    this._statusBar = statusBar;
  }

  protected get _webview(): Webview | undefined {
    return this._view?.webview;
  }

  public async handleMessage(
      message: any,
      fetchRepos?: FetchRepositoriesFn,
      fetchScore?: FetchScoreForRepoFn,
      ws?: SidebarActionDeps['workspace'],
      fs?: SidebarActionDeps['fs'],
      win?: SidebarActionDeps['window'],
  ): Promise<void> {
    const actionDeps: SidebarActionDeps = {
      workspace: ws ?? defaultActionDeps.workspace,
      fs: fs ?? defaultActionDeps.fs,
      window: win ?? defaultActionDeps.window,
    };

    if (message.command === 'save_action') {
      try {
        await this._saveWorkflowFile(message.yaml, actionDeps);
        this._webview?.postMessage({command: 'action_saved'});
      } catch (err) {
        actionDeps.window.showErrorMessage(`Não foi possível salvar o workflow: ${err}`);
      }
      return;
    }

    if (message.command === 'run_action') {
      await this._runAction(message.yaml, actionDeps);
      return;
    }

    await this._handleCommonMessage(message, fetchRepos, fetchScore);
  }

  protected logger() {
    return (msg: string) => this._log.appendLine(msg);
  }

  protected onLoadStart(): void {
    this._log.show(true);
    this._statusBar.setLoading();
  }

  protected onScoreLoaded(data: any): void {
    if (data.noData) {
      this._statusBar.setNoData();
    } else {
      this._statusBar.setScore(data.score);
    }
  }

  protected onScoreError(): void {
    this._statusBar.setError();
  }

  public resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        Uri.joinPath(this._extensionContext.extensionUri, 'out'),
        Uri.joinPath(this._extensionContext.extensionUri, 'webview-ui/build'),
      ],
    };

    webviewView.webview.html = this._getWebviewContent(
        webviewView.webview,
        this._extensionContext.extensionUri,
    );

    this._setWebviewMessageListener(webviewView.webview);
  }

  protected onReposEmpty(): void {
    this._statusBar.setError();
  }

  private async _saveWorkflowFile(yaml: string, deps: SidebarActionDeps = defaultActionDeps): Promise<string> {
    const folder = deps.workspace.workspaceFolders?.[0];
    if (!folder) {
      throw new Error('Abra uma pasta/workspace antes de salvar o workflow.');
    }

    const workspacePath = folder.uri.fsPath;
    const workflowAbsPath = path.join(workspacePath, WORKFLOW_REL_PATH);

    await deps.fs.mkdir(path.dirname(workflowAbsPath), {recursive: true});
    await deps.fs.writeFile(workflowAbsPath, yaml, 'utf-8');

    return workspacePath;
  }

  private async _runAction(yaml: string, deps: SidebarActionDeps = defaultActionDeps) {
    let workspacePath: string;
    try {
      workspacePath = await this._saveWorkflowFile(yaml, deps);
    } catch (err) {
      deps.window.showErrorMessage(`${err}`);
      return;
    }

    const dockerDir = Uri.joinPath(this._extensionContext.extensionUri, 'resources', 'docker').fsPath;

    const terminal = deps.window.createTerminal({
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

  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(async (message: any) => {
      await this.handleMessage(message);
    });
  }
}