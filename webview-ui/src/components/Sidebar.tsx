import React from 'react';
import type { ScoreData, TabName } from '../types';
import { getCharStatus, getStatusColor } from '../utils/helpers';

interface SidebarProps {
  scoreData: ScoreData | null;
  scoreLoading: boolean;
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
  onRunAnalysis,
  onStopAnalysis,
  onShowSettings,
  isRunning,
  onShowTab,
}) => {
  return (
    <div className="sh">
      <div className="st">MSGRAM — qualidade local</div>
      <div className="sbtns">
        <button className="btn" id="btn-run" onClick={onRunAnalysis} disabled={isRunning}>
          {isRunning ? (
            <>
              <i className="ti ti-loader run-anim" /> Analisando...
            </>
          ) : (
            <>
              <i className="ti ti-player-play" /> Analisar
            </>
          )}
        </button>

        {isRunning && (
          <button
            className="btn"
            id="btn-stop"
            onClick={onStopAnalysis}
            style={{ background: '#c72e2e' }}
          >
            <i className="ti ti-player-stop" /> Parar
          </button>
        )}

        <button className="btn sec" onClick={onShowSettings}>
          <i className="ti ti-settings" /> Config
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <div className="slbl">
          <i className="ti ti-trophy" /> Nota do Produto
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
          <div className="score-lbl">score geral · R2025.1</div>
        </div>

        <div className="slbl">
          <i className="ti ti-chart-bar" /> Características
        </div>

        <div id="chars-sidebar">
          {scoreLoading || !scoreData ? (
            <div className="srow" style={{ padding: '6px 0' }}>
              <i className="ti ti-loader run-anim" style={{ color: '#666', fontSize: 13 }} />
              <span className="stxt">carregando...</span>
            </div>
          ) : (
            scoreData.characteristics.map((c) => {
              const status = getCharStatus(c.value, c.goal);
              const color = getStatusColor(status);
              return (
                <React.Fragment key={c.name}>
                  <div className="mrow" onClick={() => onShowTab('dashboard')}>
                    <div className="mn">
                      <i className={`ti ti-chart-dots ${status}`} /> {c.name}
                    </div>
                    <span className={`mv ${status}`}>{c.value.toFixed(2)}</span>
                  </div>
                  <div className="bar">
                    <div className="barbg">
                      <div
                        className="barfill"
                        style={{
                          width: `${(c.value * 100).toFixed(0)}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="divider" style={{ marginTop: 8 }} />

        <div className="slbl">
          <i className="ti ti-info-circle" /> Status
        </div>
        <div className="srow">
          <div className="sdot" style={{ background: '#4ec9b0' }} />
          <span className="stxt">Conectado · meu-produto · R2025.1</span>
        </div>
        <div className="srow">
          <div className="sdot" style={{ background: '#4ec9b0' }} />
          <span className="stxt">SonarQube · projeto-key OK</span>
        </div>
      </div>
    </div>
  );
};