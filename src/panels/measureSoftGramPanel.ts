import {Disposable, ExtensionContext, Uri, ViewColumn, Webview, WebviewPanel, window, workspace} from 'vscode';
import {MeasureSoftGramBase} from './measureSoftGramBase';
import * as fs from 'fs/promises';
import * as path from 'path';

const WORKFLOW_REL_PATH = '.github/workflows/msgram.yml';

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
      if (disposable) {
        disposable.dispose();
      }
    }
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
      const handled = await this._handleCommonMessage(message);
      if (handled) {
        return;
      }

      switch (message.command) {
        case 'save_action': {
          try {
            await this._saveWorkflowFile(message.yaml);
            webview.postMessage({command: 'action_saved'});
          } catch (err) {
            window.showErrorMessage(`Não foi possível salvar o workflow: ${err}`);
          }
          break;
        }

        case 'run_action':
          this._runAction(message.yaml);
          break;
      }
    }, undefined, this._disposables);
  }
}