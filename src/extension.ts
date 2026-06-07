import {commands, ExtensionContext, window} from "vscode";
import {MeasureSoftGramPanel} from "./panels/MeasureSoftGramPanel";
import {MeasureSoftGramSidebar} from "./panels/MeasureSoftGramSidebar";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand("msgram.run", () => {
            MeasureSoftGramPanel.render(context.extensionUri);
        })
    );

    const sidebar = new MeasureSoftGramSidebar(context.extensionUri);
    context.subscriptions.push(
        window.registerWebviewViewProvider(
            MeasureSoftGramSidebar.viewType,
            sidebar
        )
    );
}