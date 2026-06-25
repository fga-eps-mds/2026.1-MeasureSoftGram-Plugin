import React from 'react';
import type { RepoItem, ScoreData, TabName } from '../types';
import { getCharStatus, getStatusColor } from '../utils/helpers';

interface SidebarProps {
  scoreData: ScoreData | null;
  scoreLoading: boolean;
  repos: RepoItem[];
  selectedRepoPk: number | null;
  onSelectRepo: (repoPk: number) => void;
  onRunAnalysis: () => void;
  onStopAnalysis: () => void;
  onShowSettings: () => void;
  isRunning: boolean;
  activeTab: TabName;
  onShowTab: (tab: TabName) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  scoreData,
  scoreLoading,
  repos,
  selectedRepoPk,
  onSelectRepo,
  onRunAnalysis,
  onStopAnalysis,
  onShowSettings,
  isRunning,
  onShowTab,
}) => {
  const renderCharsContent = (): React.ReactNode => {
    if (scoreLoading || !scoreData) {
      return (
        <div className="srow" style={{ padding: '6px 0' }}>
          <i className="ti ti-loader run-anim" style={{ color: '#a8bdd4', fontSize: 13 }} />
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#a8bdd4', marginLeft: 6 }}>
            carregando...
          </span>
        </div>
      );
    }
    if (scoreData.noData) {
      return (
        <div className="srow" style={{ padding: '6px 0', color: '#888', fontSize: 11 }}>
          <i className="ti ti-mood-empty" style={{ marginRight: 4 }} />
          <span className="stxt">nenhum dado disponível</span>
        </div>
      );
    }
    return scoreData.characteristics.map((c) => {
      const status = getCharStatus(c.value, c.goal);
      const color = getStatusColor(status);
      return (
        <React.Fragment key={c.name}>
          <div className="mrow" onClick={() => onShowTab('dashboard')}>
            <div className="mn" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#F4F5F6' }}>
              <i className={`ti ti-chart-dots ${status}`} style={{ marginRight: 4 }} /> {c.name}
            </div>
            <span className={`mv ${status}`} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
              {c.value.toFixed(2)}
            </span>
          </div>
          <div className="bar">
            <div className="barbg">
              <div className="barfill" style={{ width: `${(c.value * 100).toFixed(0)}%`, background: color }} />
            </div>
          </div>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="sh">
      {/* Header com branding */}
      <div style={{
        background: '#2B4D6F',
        borderRadius: 6,
        padding: '18px 16px',
        marginBottom: 14,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Quattrocento, Georgia, serif',
          fontSize: 22,
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: 0.4,
        }}>
          MeasureSoftGram
        </div>
        <div style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 12,
          color: '#FFFFFF',
          marginTop: 4,
          letterSpacing: 0.3,
        }}>
          Análise multidimensional da qualidade de software
        </div>
      </div>

      <div className="sbtns">
        <button className="btn" id="btn-run" onClick={onRunAnalysis} disabled={isRunning}>
          {isRunning ? (
            <><i className="ti ti-loader run-anim" /> Analisando...</>
          ) : (
            <><i className="ti ti-player-play" /> Analisar</>
          )}
        </button>

        {isRunning && (
          <button className="btn" id="btn-stop" onClick={onStopAnalysis} style={{ background: '#c72e2e' }}>
            <i className="ti ti-player-stop" /> Parar
          </button>
        )}

        <button className="btn sec" onClick={onShowSettings}>
          <i className="ti ti-settings" /> Config
        </button>
      </div>

      {/* Seletor de repositório */}
      {repos.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="slbl">
            <i className="ti ti-git-branch" /> Repositório
          </div>
          <select
            style={{
              width: '100%',
              background: 'var(--vscode-input-background)',
              color: 'var(--vscode-input-foreground)',
              border: '1px solid var(--vscode-input-border)',
              borderRadius: 3,
              padding: '4px 6px',
              fontSize: 12,
              cursor: 'pointer',
            }}
            value={selectedRepoPk ?? ''}
            onChange={(e) => onSelectRepo(Number(e.target.value))}
          >
            {repos.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <div style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#F4F5F6',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          <i className="ti ti-trophy" style={{ marginRight: 4 }} /> Nota do Produto
        </div>

        <div className="score-box">
          <div className="score-num" id="sb-score">
            {scoreLoading ? (
              <i className="ti ti-loader run-anim" />
            ) : scoreData ? (
              scoreData.score.toFixed(2)
            ) : (
              '—'
            )}
          </div>
          <div className="score-lbl" style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#a8bdd4' }}>
            score geral · R2025.1
          </div>
        </div>

        {!scoreLoading && scoreData?.noData && (
          <div className="notif warn-n" style={{ margin: '6px 0', fontSize: 11 }}>
            <i className="ti ti-alert-circle" style={{ color: '#cca700' }} />
            <span>Métricas ainda não calculadas para este repositório.</span>
          </div>
        )}

        <div style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#F4F5F6',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginTop: 10,
          marginBottom: 6,
        }}>
          <i className="ti ti-chart-bar" style={{ marginRight: 4 }} /> Características
        </div>

        <div id="chars-sidebar">
          {renderCharsContent()}
        </div>

        <div className="divider" style={{ marginTop: 8 }} />

        <div style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#F4F5F6',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginTop: 8,
          marginBottom: 6,
        }}>
          <i className="ti ti-info-circle" style={{ marginRight: 4 }} /> Status
        </div>
        <div className="srow">
          <div className="sdot" style={{ background: scoreData ? '#4ec9b0' : '#666' }} />
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#F4F5F6' }}>
            {scoreData ? 'Conectado' : 'Sem dados'} · R2025.1
          </span>
        </div>
      </div>
    </div>
  );
};
