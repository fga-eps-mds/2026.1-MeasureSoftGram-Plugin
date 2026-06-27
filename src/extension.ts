import {commands, ExtensionContext, window} from "vscode";
import {MeasureSoftGramPanel} from "./panels/measureSoftGramPanel";
import {MeasureSoftGramSidebar} from "./panels/measureSoftGramSidebar";
import {MsgramStatusBar} from "./statusbar/msgramStatusBar";
import {activate as _activate} from "./activator";

export function activate(context: ExtensionContext) {
    _activate(context, {commands, window}, MeasureSoftGramPanel, MeasureSoftGramSidebar, MsgramStatusBar);
}