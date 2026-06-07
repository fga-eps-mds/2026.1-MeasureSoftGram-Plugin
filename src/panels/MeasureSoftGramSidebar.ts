import {Uri, Webview, WebviewView, WebviewViewProvider} from "vscode";
import {getNonce, getUri} from "../utilities/utilities";

export class MeasureSoftGramSidebar implements WebviewViewProvider {
    public static readonly viewType = "msgram.sidebarView";
    private _view?: WebviewView;

    constructor(private readonly _extensionUri: Uri) {
    }

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

    private _setWebviewMessageListener(webview: Webview) {
        webview.onDidReceiveMessage((message: any) => {
            switch (message.command) {
                case "hello":
                    return;
            }
        });
    }
}