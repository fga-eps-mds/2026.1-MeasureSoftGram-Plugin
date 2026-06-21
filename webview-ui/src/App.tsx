import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar }       from './components/Sidebar';
import { Tabs }          from './components/Tabs';
import { DashboardView } from './components/DashboardView';
import { SettingsView }  from './components/SettingsView';
import { ActionView }    from './components/action/ActionView.tsx';
import { getVSCodeAPI }  from './utils/vscode';
import { now }           from './utils/helpers';

import type {
  TabName,
  ScoreData,
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
  const [scoreError, setScoreError]     = useState<string | null>(null);
  const [notifText, setNotifText]       = useState('Análise concluída. 2 de 3 características dentro da meta da release.');
  const [notifType, setNotifType]       = useState<'ok' | 'error'>('ok');

  const [isRunning, setIsRunning]           = useState(false);
  const [showCommitWarn, setShowCommitWarn] = useState(true);

  const [isPublishing, setIsPublishing]   = useState(false);
  const [publishStatus, setPublishStatus] = useState('');

  const [settingsSavedFeedback, setSettingsSavedFeedback] = useState(false);

  const [yaml, setYaml]                             = useState('');
  const [actionSavedFeedback, setActionSavedFeedback] = useState(false);

  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionMessage>) => {
      const msg = event.data;
      switch (msg.command) {

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
          break;

        case 'analysis_done':
          setIsRunning(false);
          setShowCommitWarn(false);
          if (msg.success) {
            setTimeout(() => showTab('dashboard'), 600);
          }
          break;

        case 'analysis_stopped':
          setIsRunning(false);
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
  }, [showTab]);

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

  const handleRunAction = () => {
    vscode.postMessage({ command: 'run_action', yaml });
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
                  scoreLoading={scoreLoading}
                  scoreError={scoreError}
                  showCommitWarn={showCommitWarn}
                  notifText={notifText}
                  notifType={notifType}
                  publishStatus={publishStatus}
                  isPublishing={isPublishing}
                  onPublish={handlePublish}
              />
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
              />
          )}

        </div>
      </>
  );
};

export default App;