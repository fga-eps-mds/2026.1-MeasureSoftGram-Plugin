export interface VSCodeAPI {
  postMessage(message: PanelMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare global {
  function acquireVsCodeApi(): VSCodeAPI;
}

export type PanelMessage =
  | { command: 'run_analysis' }
  | { command: 'stop_analysis' }
  | { command: 'publish' }
  | { command: 'request_yaml' }
  | { command: 'request_score' }
  | { command: 'save_action'; yaml: string }
  | { command: 'save_settings'; data: SettingsData };

export type ExtensionMessage =
  | { command: 'score_loading' }
  | { command: 'score_loaded'; data: ScoreData }
  | { command: 'score_error'; message: string }
  | { command: 'analysis_started' }
  | { command: 'output_line'; line: string; isError: boolean }
  | { command: 'analysis_done'; success: boolean; exitCode: number }
  | { command: 'analysis_stopped' }
  | { command: 'yaml_loaded'; yaml: string }
  | { command: 'action_saved' }
  | { command: 'published'; release: string }
  | { command: 'settings_saved' };

export interface Characteristic {
  name: string;
  value: number;
  goal: number;
}

export interface ScoreData {
  score: number;
  characteristics: Characteristic[];
}

export interface SettingsData {
  token: string;
  productName: string;
  serviceUrl: string;
}

export type TabName = 'dashboard' | 'output' | 'settings' | 'action';

export interface LogLine {
  time: string;
  text: string;
  isError: boolean;
}