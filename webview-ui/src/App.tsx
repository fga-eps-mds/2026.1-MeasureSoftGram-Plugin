import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar }       from './components/Sidebar';
import { Tabs }          from './components/Tabs';
import { DashboardView } from './components/DashboardView';
import { OutputView }    from './components/OutputView';
import { SettingsView }  from './components/SettingsView';
import { ActionView }    from './components/ActionView';
import { getVSCodeAPI }  from './utils/vscode';
import { now }           from './utils/helpers';

import type {
  TabName,
  ScoreData,
  LogLine,
  SettingsData,
  ExtensionMessage,
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

  const [scoreData, setScoreData]       = useState<ScoreData | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [notifText, setNotifText]       = useState('Análise concluída. 2 de 3 características dentro da meta da release.');
  const [notifType, setNotifType]       = useState<'ok' | 'error'>('ok');

  const [isRunning, setIsRunning]           = useState(false);
  const [showCommitWarn, setShowCommitWarn] = useState(true);
  const [logLines, setLogLines]             = useState<LogLine[]>([
    { time: '09:14:01', text: '[MSGRAM] Executando pipeline action...', isError: false },
    { time: '09:14:08', text: '✓ Pipeline concluído com sucesso.',      isError: false },
    { time: '09:14:08', text: '[MSGRAM] Análise concluída. Veja o painel para detalhes.', isError: false },
  ]);

  const appendLog = useCallback((text: string, isError: boolean) => {
    setLogLines(prev => [...prev, { time: now(), text, isError }]);
  }, []);

  const [isPublishing, setIsPublishing]   = useState(false);
  const [publishStatus, setPublishStatus] = useState('');

  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);

  const [yaml, setYaml]                   = useState('');
  const [actionSavedFeedback, setActionSavedFeedback] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.command) {

        case 'score_loading':
          setScoreLoading(true);
          break;

        case 'score_loaded':
          setScoreLoading(false);
          setScoreData(msg.data);
          break;

        case 'score_error':
          setScoreLoading(false);
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
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [showTab, appendLog]);

  const handleRunAnalysis  = () => vscode.postMessage({ command: 'run_analysis' });
  const handleStopAnalysis = () => vscode.postMessage({ command: 'stop_analysis' });

  const handlePublish = () => {
    setIsPublishing(true);
    vscode.postMessage({ command: 'publish' });
  };

  const handleSaveSettings = (data: SettingsData) => {
    vscode.postMessage({ command: 'save_settings', data });
  };

  const handleSaveAction = () => {
    vscode.postMessage({ command: 'save_action', yaml });
  };

  return (
    <>
      <Sidebar
        scoreData={scoreData}
        scoreLoading={scoreLoading}
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
          />
        )}

      </div>
    </>
  );
};

export default App;