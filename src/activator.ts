export function activate(
    context: { subscriptions: { push: (d: { dispose: () => void }) => void } },
    vscode: {
        commands: { registerCommand: (id: string, fn: () => void) => { dispose: () => void } };
        window: { registerWebviewViewProvider: (id: string, p: any, o?: any) => { dispose: () => void } };
    },
    Panel: { render: (ctx: any) => void },
    Sidebar: { new(ctx: any, statusBar: any): any; viewType: string },
    StatusBar: { new(): { dispose: () => void } }
) {
    const statusBar = new StatusBar();
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.commands.registerCommand('msgram.run', () => Panel.render(context))
    );

    const sidebar = new Sidebar(context, statusBar);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(Sidebar.viewType, sidebar, {
            webviewOptions: {retainContextWhenHidden: true},
        })
    );
}