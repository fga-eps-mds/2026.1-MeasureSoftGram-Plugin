import React from 'react';
import type {RepoItem, ScoreData, TabName} from '../types';
import {getCharStatus, getStatusColor} from '../utils/helpers';

interface SidebarProps {
    scoreData: ScoreData | null;
    scoreLoading: boolean;
    scoreError: boolean;
    repos: RepoItem[];
    selectedRepoPk: number | null;
    onSelectRepo: (repoPk: number) => void;
    activeTab: TabName;
    onShowTab: (tab: TabName) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
                                                    scoreData,
                                                    scoreLoading,
                                                    scoreError,
                                                    repos,
                                                    selectedRepoPk,
                                                    onSelectRepo,
                                                    onShowTab,
                                                }) => {
    const renderCharsContent = (): React.ReactNode => {
        if (scoreLoading || !scoreData) {
            return (
                <div className="srow" style={{padding: '6px 0'}}>
                    <i className="ti ti-loader run-anim" style={{color: '#5F7EA3', fontSize: 13}}/>
                    <span style={{fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#5F7EA3', marginLeft: 6}}>
            carregando...
          </span>
                </div>
            );
        }
        if (scoreData.noData) {
            return (
                <div className="srow" style={{padding: '6px 0', color: '#888', fontSize: 11}}>
                    <i className="ti ti-mood-empty" style={{marginRight: 4}}/>
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
                        <div className="mn" style={{fontFamily: 'Roboto, sans-serif', fontSize: 11}}>
                            <i className={`ti ti-chart-dots ${status}`} style={{marginRight: 4}}/> {c.name}
                        </div>
                        <span className={`mv ${status}`} style={{fontFamily: 'Roboto, sans-serif', fontSize: 11}}>
              {c.value.toFixed(2)}
            </span>
                    </div>
                    <div className="bar">
                        <div className="barbg">
                            <div className="barfill"
                                 style={{width: `${(c.value * 100).toFixed(0)}%`, background: color}}/>
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
                padding: '16px 14px',
                marginBottom: 12,
                textAlign: 'center',
            }}>
                <div style={{
                    fontFamily: 'Quattrocento, Georgia, serif',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: 0.4,
                }}>
                    MeasureSoftGram
                </div>
                <div style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.75)',
                    marginTop: 3,
                    letterSpacing: 0.2,
                }}>
                    Análise multidimensional da qualidade de software
                </div>
            </div>

            {/* Seletor de repositório */}
            {repos.length > 0 && (
                <div style={{marginTop: 10}}>
                    <div className="slbl">
                        <i className="ti ti-git-branch"/> Repositório
                    </div>
                    <select
                        style={{
                            width: '100%',
                            background: '#FFFFFF',
                            color: scoreError ? '#D13310' : '#333',
                            border: `1px solid ${scoreError ? '#D1331066' : '#C5C8CC'}`,
                            borderRadius: 3,
                            padding: '4px 6px',
                            fontSize: 11,
                            cursor: 'pointer',
                        }}
                        value={scoreError ? '' : (selectedRepoPk ?? '')}
                        onChange={(e) => onSelectRepo(Number(e.target.value))}
                    >
                        {scoreError
                            ? <option value="" disabled>produto não encontrado</option>
                            : repos.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))
                        }
                    </select>
                </div>
            )}

            <div style={{marginTop: 10}}>
                <div style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#2B4D6F',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                }}>
                    <i className="ti ti-trophy" style={{marginRight: 4}}/> Nota do Produto
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
                    <div className="score-lbl" style={{fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#888'}}>
                        TSQMI
                    </div>
                </div>

                {!scoreLoading && scoreData?.noData && (
                    <div className="notif warn-n" style={{margin: '6px 0', fontSize: 10}}>
                        <i className="ti ti-alert-circle" style={{color: '#DF8E16'}}/>
                        <span>Métricas ainda não calculadas para este repositório.</span>
                    </div>
                )}

                <div style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#2B4D6F',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    marginTop: 10,
                    marginBottom: 6,
                }}>
                    <i className="ti ti-chart-bar" style={{marginRight: 4}}/> Características
                </div>

                <div id="chars-sidebar">
                    {renderCharsContent()}
                </div>

                <div className="divider" style={{marginTop: 8}}/>

                <div style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#2B4D6F',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    marginTop: 8,
                    marginBottom: 6,
                }}>
                    <i className="ti ti-info-circle" style={{marginRight: 4}}/> Status
                </div>
                <div className="srow">
                    <div className="sdot" style={{background: scoreData ? '#04724D' : '#888'}}/>
                    <span style={{fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#333'}}>
            {scoreData ? 'Conectado' : 'Sem dados'}
          </span>
                </div>
            </div>
        </div>
    );
};
