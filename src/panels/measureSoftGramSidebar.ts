import {
  ExtensionContext,
  OutputChannel,
  Uri,
  Webview,
  WebviewView,
  WebviewViewProvider,
  window,
  workspace
} from 'vscode';
import {MeasureSoftGramBase} from './measureSoftGramBase';
import {MsgramStatusBar} from '../statusbar/msgramStatusBar';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKFLOW_REL_PATH = '.github/workflows/msgram.yml';

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

  protected onReposEmpty(): void {
    this._statusBar.setError();
  }

  private async _saveWorkflowFile(yaml: string): Promise<string> {
    const folder = workspace.workspaceFolders?.[0];
    if (!folder) {
      throw new Error('Abra uma pasta/workspace antes de salvar o workflow.');
    }

    const workspacePath = folder.uri.fsPath;
    const workflowAbsPath = path.join(workspacePath, WORKFLOW_REL_PATH);

    await fs.mkdir(path.dirname(workflowAbsPath), {recursive: true});
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

    const dockerDir = Uri.joinPath(this._extensionContext.extensionUri, 'resources', 'docker').fsPath;

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


  private _setWebviewMessageListener(webview: Webview) {
    webview.onDidReceiveMessage(async (message: any) => {
      if (message.command === 'save_action') {
        try {
          await this._saveWorkflowFile(message.yaml);
          webview.postMessage({command: 'action_saved'});
        } catch (err) {
          window.showErrorMessage(`Não foi possível salvar o workflow: ${err}`);
        }
        return;
      }

      if (message.command === 'run_action') {
        await this._runAction(message.yaml);
        return;
      }

      await this._handleCommonMessage(message);
    });
  }
}