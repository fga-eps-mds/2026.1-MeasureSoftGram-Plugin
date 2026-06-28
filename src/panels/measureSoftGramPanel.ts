import {Disposable, ExtensionContext, Uri, ViewColumn, Webview, WebviewPanel, window, workspace} from 'vscode';
import {FetchRepositoriesFn, FetchScoreForRepoFn, MeasureSoftGramBase} from './measureSoftGramBase';
import * as defaultFs from 'fs/promises';
import * as path from 'path';

const WORKFLOW_REL_PATH = '.github/workflows/msgram.yml';

export interface PanelActionDeps {
  workspace: { workspaceFolders: typeof workspace.workspaceFolders };
  fs: { mkdir: typeof defaultFs.mkdir; writeFile: typeof defaultFs.writeFile };
  window: { createTerminal: typeof window.createTerminal; showErrorMessage: typeof window.showErrorMessage };
}

const defaultActionDeps: PanelActionDeps = {
  workspace,
  fs: {mkdir: defaultFs.mkdir, writeFile: defaultFs.writeFile},
  window: {createTerminal: window.createTerminal.bind(window), showErrorMessage: window.showErrorMessage.bind(window)},
};

export class MeasureSoftGramPanel extends MeasureSoftGramBase {
  public static currentPanel: MeasureSoftGramPanel | undefined;

  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, extensionContext: ExtensionContext) {
    super(extensionContext);
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(
        this._panel.webview,
        extensionContext.extensionUri,
    );
    this._setWebviewMessageListener(this._panel.webview);
  }

  protected get _webview(): Webview {
    return this._panel.webview;
  }

  public static render(extensionContext: ExtensionContext, vswindow = window) {
    if (MeasureSoftGramPanel.currentPanel) {
      MeasureSoftGramPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = vswindow.createWebviewPanel(
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
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public async handleMessage(
      message: any,
      fetchRepos?: FetchRepositoriesFn,
      fetchScore?: FetchScoreForRepoFn,
      ws?: PanelActionDeps['workspace'],
      fs?: PanelActionDeps['fs'],
      win?: PanelActionDeps['window'],
  ): Promise<void> {
    const actionDeps: PanelActionDeps = {
      workspace: ws ?? defaultActionDeps.workspace,
      fs: fs ?? defaultActionDeps.fs,
      window: win ?? defaultActionDeps.window,
    };

    if (message.command === 'save_action') {
      try {
        await this._saveWorkflowFile(message.yaml, actionDeps);
        this._webview.postMessage({command: 'action_saved'});
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

  private async _saveWorkflowFile(yaml: string, deps: PanelActionDeps = defaultActionDeps): Promise<string> {
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

  private async _runAction(yaml: string, deps: PanelActionDeps = defaultActionDeps) {
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
    }, undefined, this._disposables);
  }
}