import {Uri, Webview, WebviewView, WebviewViewProvider, window, workspace} from "vscode";
import {getNonce, getUri} from "../utilities/utilities";
import * as fs from "fs/promises";
import * as path from "path";

const WORKFLOW_REL_PATH = ".github/workflows/msgram.yml";

export class MeasureSoftGramSidebar implements WebviewViewProvider {
    public static readonly viewType = "msgram.sidebarView";
    private _view?: WebviewView;

    constructor(private readonly _extensionUri: Uri) {}

    public resolveWebviewView(webviewView: WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                Uri.joinPath(this._extensionUri, "out"),
                Uri.joinPath(this._extensionUri, "webview-ui/build"),
            ],
        };

        webviewView.webview.html = this._getWebviewContent(
            webviewView.webview,
            this._extensionUri
        );

        this._setWebviewMessageListener(webviewView.webview);
    }

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.css"]);
        const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "assets", "index.js"]);
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

    private async _runAction(yaml: string) {
        const folder = workspace.workspaceFolders?.[0];
        if (!folder) {
            window.showErrorMessage("Abra uma pasta/workspace antes de executar a action.");
            return;
        }

        const workspacePath = folder.uri.fsPath;
        const workflowAbsPath = path.join(workspacePath, WORKFLOW_REL_PATH);

        try {
            await fs.mkdir(path.dirname(workflowAbsPath), { recursive: true });
            await fs.writeFile(workflowAbsPath, yaml, "utf-8");
        } catch (err) {
            window.showErrorMessage(`Não foi possível salvar o workflow: ${err}`);
            return;
        }

        const dockerDir = Uri.joinPath(this._extensionUri, "resources", "docker").fsPath;

        const terminal = window.createTerminal({
            name: "MeasureSoftGram · Act",
            cwd: dockerDir,
            env: {
                WORKSPACE_PATH: workspacePath,
                WORKFLOW_REL_PATH: WORKFLOW_REL_PATH,
            },
        });

        terminal.show();
        terminal.sendText("docker compose up --build --abort-on-container-exit");
    }

    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage((message: any) => {
            switch (message.command) {
                case "run_action": {
                    this._runAction(message.yaml);
                    return;
                }
            }
        });
    }
}