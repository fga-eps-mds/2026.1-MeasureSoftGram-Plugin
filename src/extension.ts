import { commands, ExtensionContext, window } from "vscode";
import { MeasureSoftGramPanel } from "./panels/MeasureSoftGramPanel";
import { MeasureSoftGramSidebar } from "./panels/MeasureSoftGramSidebar";
import { MsgramStatusBar } from "./statusbar/MsgramStatusBar";

export function activate(context: ExtensionContext) {
    const statusBar = new MsgramStatusBar();
    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        commands.registerCommand("msgram.run", () => {
            MeasureSoftGramPanel.render(context);
        })
    );

    const sidebar = new MeasureSoftGramSidebar(context, statusBar);
    context.subscriptions.push(
        window.registerWebviewViewProvider(
            MeasureSoftGramSidebar.viewType,
            sidebar,
            { webviewOptions: { retainContextWhenHidden: true } }
        )
    );
}