import { commands, ExtensionContext, window } from "vscode";
import { MeasureSoftGramPanel } from "./panels/MeasureSoftGramPanel";
import { MeasureSoftGramSidebar } from "./panels/MeasureSoftGramSidebar";
import { MsgramStatusBar } from "./statusbar/msgramStatusBar";
import { activate as _activate } from "./activator";

export function activate(context: ExtensionContext) {
    _activate(context, { commands, window }, MeasureSoftGramPanel, MeasureSoftGramSidebar, MsgramStatusBar);
}