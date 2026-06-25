import React from 'react';
import type {ScoreData, TabName} from '../types';
import {getCharStatus, getStatusColor} from '../utils/helpers';

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
                                                  onShowTab,
                                                }) => {
  return (
      <div className="sh">

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

        <div style={{marginTop: 6}}>

          <div style={{
            fontFamily: 'Roboto, sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#F4F5F6',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            <i className="ti ti-trophy" style={{marginRight: 4}}/>
            Nota do Produto
          </div>

          <div className="score-box">
            <div className="score-num" id="sb-score">
              {scoreLoading ? (
                  <i className="ti ti-loader run-anim"/>
              ) : scoreData ? (
                  scoreData.score.toFixed(2)
              ) : (
                  '—'
              )}
            </div>
            <div className="score-lbl" style={{
              fontFamily: 'Roboto, sans-serif',
              fontSize: 12,
              color: '#a8bdd4',
            }}>
              score geral · R2025.1
            </div>
          </div>

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
            <i className="ti ti-chart-bar" style={{marginRight: 4}}/>
            Características
          </div>

          <div id="chars-sidebar">
            {scoreLoading || !scoreData ? (
                <div className="srow" style={{padding: '6px 0'}}>
                  <i className="ti ti-loader run-anim" style={{color: '#a8bdd4', fontSize: 13}}/>
                  <span style={{fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#a8bdd4', marginLeft: 6}}>
                carregando...
              </span>
                </div>
            ) : (
                scoreData.characteristics.map((c) => {
                  const status = getCharStatus(c.value, c.goal);
                  const color = getStatusColor(status);
                  return (
                      <React.Fragment key={c.name}>
                        <div className="mrow" onClick={() => onShowTab('dashboard')}>
                          <div className="mn" style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: 13,
                            color: '#F4F5F6',
                          }}>
                            <i className={`ti ti-chart-dots ${status}`} style={{marginRight: 4}}/>
                            {c.name}
                          </div>
                          <span className={`mv ${status}`} style={{
                            fontFamily: 'Roboto, sans-serif',
                            fontSize: 13,
                          }}>
                      {c.value.toFixed(2)}
                    </span>
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

          <div className="divider" style={{marginTop: 8}}/>

          {/* Status */}
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
            <i className="ti ti-info-circle" style={{marginRight: 4}}/>
            Status
          </div>

          <div className="srow">
            <div className="sdot" style={{background: '#4ec9b0'}}/>
            <span style={{fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#F4F5F6'}}>
            Conectado · meu-produto · R2025.1
          </span>
          </div>
          <div className="srow">
            <div className="sdot" style={{background: '#4ec9b0'}}/>
            <span style={{fontFamily: 'Roboto, sans-serif', fontSize: 13, color: '#F4F5F6'}}>
            SonarQube · projeto-key OK
          </span>
          </div>

        </div>
      </div>
  );
};