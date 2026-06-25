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

    private async _saveWorkflowFile(yaml: string): Promise<string> {
        const folder = workspace.workspaceFolders?.[0];
        if (!folder) {
            throw new Error("Abra uma pasta/workspace antes de salvar o workflow.");
        }

        const workspacePath = folder.uri.fsPath;
        const workflowAbsPath = path.join(workspacePath, WORKFLOW_REL_PATH);

        await fs.mkdir(path.dirname(workflowAbsPath), { recursive: true });
        await fs.writeFile(workflowAbsPath, yaml, "utf-8");

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
        webview.onDidReceiveMessage(async (message: any) => {
            switch (message.command) {

                case "save_action": {
                    try {
                        await this._saveWorkflowFile(message.yaml);
                        webview.postMessage({ command: "action_saved" });
                    } catch (err) {
                        window.showErrorMessage(`Não foi possível salvar o workflow: ${err}`);
                    }
                    return;
                }

                case "run_action": {
                    this._runAction(message.yaml);
                    return;
                }
            }
        });
    }
}