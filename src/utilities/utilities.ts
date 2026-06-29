export function getUri(
    webview: { asWebviewUri: (uri: any) => any },
    extensionUri: any,
    pathList: string[],
    joinPath: (base: any, ...paths: string[]) => any = require('vscode').Uri.joinPath
) {
    return webview.asWebviewUri(joinPath(extensionUri, ...pathList));
}

export function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}