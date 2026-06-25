import { StatusBarAlignment, StatusBarItem, ThemeColor, window } from 'vscode';

export class MsgramStatusBar {
  private readonly _item: StatusBarItem;

  constructor() {
    this._item = window.createStatusBarItem(StatusBarAlignment.Left, 100);
    this._item.command = 'msgram.sidebarView.focus';
    this._item.tooltip = 'MeasureSoftGram — clique para abrir';
    this.setLoading();
    this._item.show();
  }

  setLoading(): void {
    this._item.text = '$(sync~spin) MSGRAM: ...';
    this._item.color = undefined;
    this._item.backgroundColor = undefined;
  }

  setScore(score: number): void {
    this._item.text = `$(chart-bar) MSGRAM: ${score.toFixed(2)}`;
    if (score >= 0.8) {
      this._item.color = new ThemeColor('charts.green');
    } else if (score >= 0.6) {
      this._item.color = new ThemeColor('charts.yellow');
    } else {
      this._item.color = new ThemeColor('charts.red');
    }
    this._item.backgroundColor = undefined;
  }

  setNoData(): void {
    this._item.text = '$(dash) MSGRAM: sem dados';
    this._item.color = undefined;
    this._item.backgroundColor = undefined;
  }

  setError(): void {
    this._item.text = '$(warning) MSGRAM: erro';
    this._item.color = new ThemeColor('statusBarItem.warningForeground');
    this._item.backgroundColor = new ThemeColor('statusBarItem.warningBackground');
  }

  dispose(): void {
    this._item.dispose();
  }
}
