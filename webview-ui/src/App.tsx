import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar }       from './components/Sidebar';
import { Tabs }          from './components/Tabs';
import { DashboardView } from './components/DashboardView';
import { OutputView }    from './components/action/OutputView.tsx';
import { SettingsView }  from './components/SettingsView';
import { ActionView }    from './components/action/ActionView.tsx';
import { getVSCodeAPI }  from './utils/vscode';
import { now }           from './utils/helpers';
import { DEFAULT_WORKFLOW_YAML } from './utils/defaultWorkflow';
import { applySettingsToYaml }   from './utils/workflowYaml';
import { getMissingSettings }    from './utils/validation';

import type {
  TabName,
  ScoreData,
  LogLine,
  SettingsData,
  ExtensionMessage,
  RepoItem,
} from './types/index';

const App: React.FC = () => {
  const vscode = getVSCodeAPI();

  const [activeTab, setActiveTab] = useState<TabName>('dashboard');

  const showTab = useCallback((tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'action') {
      vscode.postMessage({ command: 'request_yaml' });
    }
  }, [vscode]);

  const [scoreData, setScoreData]           = useState<ScoreData | null>(null);
  const [scoreLoading, setScoreLoading]     = useState(true);
  const [scoreError, setScoreError]         = useState<string | null>(null);
  const [repos, setRepos]                   = useState<RepoItem[]>([]);
  const [selectedRepoPk, setSelectedRepoPk] = useState<number | null>(null);
  const [notifText, setNotifText]           = useState('');
  const [notifType, setNotifType]           = useState<'ok' | 'error'>('ok');

  const [isRunning, setIsRunning]           = useState(false);
  const [showCommitWarn, setShowCommitWarn] = useState(true);
  const [logLines, setLogLines]             = useState<LogLine[]>([]);

  const appendLog = useCallback((text: string, isError: boolean) => {
    setLogLines(prev => [...prev, { time: now(), text, isError }]);
  }, []);

  const [isPublishing, setIsPublishing]   = useState(false);
  const [publishStatus, setPublishStatus] = useState('');

  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);
  const [settings, setSettings] = useState<Partial<SettingsData>>({});

  const [yaml, setYaml]                           = useState(DEFAULT_WORKFLOW_YAML);
  const [actionSavedFeedback, setActionSavedFeedback] = useState(false);
  const [actionAlert, setActionAlert]             = useState<string | null>(null);

  useEffect(() => {
    vscode.postMessage({ command: 'request_score' });
  }, [vscode]);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.command) {

        case 'repos_loaded':
          setRepos(msg.repos);
          if (msg.repos.length) { setSelectedRepoPk(msg.repos[0].id); }
          break;

        case 'score_loading':
          setScoreLoading(true);
          setScoreError(null);
          break;

        case 'score_loaded':
          setScoreLoading(false);
          setScoreError(null);
          setScoreData(msg.data);
          break;

        case 'score_error':
          setScoreLoading(false);
          setScoreError(msg.message);
          setNotifText(msg.message);
          setNotifType('error');
          break;

        case 'analysis_started':
          setIsRunning(true);
          setLogLines([]);
          showTab('output');
          break;

        case 'output_line':
          appendLog(msg.line, msg.isError);
          break;

        case 'analysis_done':
          setIsRunning(false);
          setShowCommitWarn(false);
          appendLog(
            msg.success
              ? 'act concluído com sucesso.'
              : `act encerrou com código ${msg.exitCode}.`,
            !msg.success,
          );
          if (msg.success) {
            setTimeout(() => showTab('dashboard'), 600);
          }
          break;

        case 'analysis_stopped':
          setIsRunning(false);
          appendLog('Execução interrompida pelo usuário.', true);
          break;

        case 'yaml_loaded':
          setYaml(msg.yaml);
          break;

        case 'action_saved':
          setActionSavedFeedback(true);
          setTimeout(() => setActionSavedFeedback(false), 3000);
          break;

        case 'published':
          setIsPublishing(false);
          setPublishStatus(`✓ Publicado em ${msg.release} às ${now()}`);
          break;

        case 'settings_saved':
          setSettingsSavedFeedback(true);
          setTimeout(() => setSettingsSavedFeedback(false), 3000);
          break;

        case 'settings_loaded':
          setSettings(msg.data);
          break;
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [showTab, appendLog]);

  const handleSelectRepo = (repoPk: number) => {
    setSelectedRepoPk(repoPk);
    vscode.postMessage({ command: 'select_repo', repoPk });
  };

  const handleRunAnalysis  = () => vscode.postMessage({ command: 'run_analysis' });
  const handleStopAnalysis = () => vscode.postMessage({ command: 'stop_analysis' });

  const handlePublish = () => {
    setIsPublishing(true);
    vscode.postMessage({ command: 'publish' });
  };

  const handleSaveSettings = (data: SettingsData) => {
    setSettings(data);
    vscode.postMessage({ command: 'save_settings', data });
  };

  const handleSaveAction = () => {
    const mergedYaml = applySettingsToYaml(yaml, settings);
    setYaml(mergedYaml);
    vscode.postMessage({ command: 'save_action', yaml: mergedYaml });
  };

  const handleRunAction = () => {
    const missing = getMissingSettings(settings);
    if (missing.length > 0) {
      const message =
        'Preencha os campos obrigatórios em Settings antes de rodar a pipeline: ' +
        missing.map((m) => m.label).join(', ');
      setActionAlert(message);
      vscode.postMessage({ command: 'show_warning', message });
      return;
    }
    setActionAlert(null);
    const mergedYaml = applySettingsToYaml(yaml, settings);
    setYaml(mergedYaml);
    vscode.postMessage({ command: 'run_action', yaml: mergedYaml });
  };

  return (
    <>
      <Sidebar
        scoreData={scoreData}
        scoreLoading={scoreLoading}
        repos={repos}
        selectedRepoPk={selectedRepoPk}
        onSelectRepo={handleSelectRepo}
        onRunAnalysis={handleRunAnalysis}
        onStopAnalysis={handleStopAnalysis}
        onShowSettings={() => showTab('settings')}
        isRunning={isRunning}
        activeTab={activeTab}
        onShowTab={showTab}
      />

      <Tabs active={activeTab} onSelect={showTab} />

      <div className="pc">

        {activeTab === 'dashboard' && (
          <DashboardView
            scoreData={scoreData}
            scoreLoading={scoreLoading}
            scoreError={scoreError}
            productName={settings.productName ?? ''}
            showCommitWarn={showCommitWarn}
            notifText={notifText}
            notifType={notifType}
            publishStatus={publishStatus}
            isPublishing={isPublishing}
            onPublish={handlePublish}
          />
        )}

        {activeTab === 'output' && (
          <OutputView lines={logLines} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onSave={handleSaveSettings}
            savedFeedback={settingsSavedFeedback}
          />
        )}

        {activeTab === 'action' && (
          <ActionView
            yaml={yaml}
            onChange={setYaml}
            onSave={handleSaveAction}
            savedFeedback={actionSavedFeedback}
            onRun={handleRunAction}
            running={isRunning}
            alert={actionAlert}
          />
        )}

      </div>
    </>
  );
};

export default App;
