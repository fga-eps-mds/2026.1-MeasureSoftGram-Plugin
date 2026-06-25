import { commands, ExtensionContext, window } from "vscode";
import {MeasureSoftGramPanel} from "./panels/MeasureSoftGramPanel";
import {MeasureSoftGramSidebar} from "./panels/MeasureSoftGramSidebar";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand("msgram.run", () => {
            MeasureSoftGramPanel.render(context);
        })
    );

    const sidebar = new MeasureSoftGramSidebar(context);
    context.subscriptions.push(
        window.registerWebviewViewProvider(
            MeasureSoftGramSidebar.viewType,
            sidebar,
            { webviewOptions: { retainContextWhenHidden: true } }
        )
    );
}