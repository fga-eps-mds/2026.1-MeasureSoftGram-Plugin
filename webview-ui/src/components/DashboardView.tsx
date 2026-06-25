import React from 'react';
import type { ScoreData } from '../types';
import { getCharStatus } from '../utils/helpers';

interface DashboardViewProps {
  scoreData: ScoreData | null;
  scoreLoading: boolean;
  scoreError: string | null;
  showCommitWarn: boolean;
  notifText: string;
  notifType: 'ok' | 'error';
  publishStatus: string;
  isPublishing: boolean;
  onPublish: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
                                                              scoreData,
                                                              scoreLoading,
                                                              scoreError,
                                                              showCommitWarn,
                                                              notifText,
                                                              notifType,
                                                              publishStatus,
                                                              isPublishing,
                                                              onPublish,
                                                            }) => {
  const score    = scoreData?.score ?? 0;
  const scorePct = (score * 100).toFixed(0);

  const worstChar = scoreData?.characteristics.reduce((worst, c) =>
      c.value - c.goal < worst.value - worst.goal ? c : worst,
  );

  return (
      <div className="vw on" id="view-dashboard">
        {/* Header */}
        <div className="view-header">
          <div>
            <div className="view-title">
              <i className="ti ti-chart-radar" style={{ color: '#0e639c', fontSize: 16 }} />
              MeasureSoftGram
            </div>
            <div className="view-sub">meu-produto · última análise: agora mesmo</div>
          </div>
          <span className="rbadge">R2025.1</span>
        </div>

        {/* Loading */}
        {scoreLoading && (
            <div className="notif" style={{ marginBottom: 14 }}>
              <i className="ti ti-loader run-anim" />
              <span>Carregando dados do produto...</span>
            </div>
        )}

        {/* Commit warning */}
        {!scoreLoading && showCommitWarn && worstChar && (
            <div className="commit-warn show" id="commit-warn">
              <div className="cw-title">
                <i className="ti ti-git-commit" /> Atenção antes do commit
              </div>
              <div className="cw-desc">
                Você ainda não rodou a análise MSGRAM nesta sessão. Commitar sem analisar pode
                introduzir regressão em{' '}
                <strong style={{ color: '#cca700' }}>{worstChar.name}</strong> — última nota{' '}
                {worstChar.value.toFixed(2)}, próxima da meta {worstChar.goal.toFixed(2)}.
              </div>
            </div>
        )}

        {/* Notification */}
        {notifText && (
            <div className={`notif${notifType === 'error' ? ' warn-n' : ''}`} id="notif-ok">
              <i
                  className={`ti ${notifType === 'error' ? 'ti-alert-circle' : 'ti-circle-check'}`}
                  style={notifType === 'error' ? { color: '#f14c4c' } : undefined}
              />
              <span>{notifText}</span>
            </div>
        )}

        {/* Score hero */}
        {!scoreLoading && (
            scoreError ? (
                <div className="notif warn-n" style={{ marginBottom: 14 }}>
                  <i className="ti ti-alert-circle" style={{ color: '#cca700' }} />
                  <span>{scoreError}</span>
                </div>
            ) : (
                <div className="score-hero">
                  <div className="hero-num" id="hero-score">
                    {scoreData ? score.toFixed(2) : '—'}
                  </div>
                  <div className="hero-right">
                    <div className="hero-lbl">Nota geral do produto — R2025.1</div>
                    <div className="hero-bar">
                      <div className="hero-fill" id="hero-fill" style={{ width: `${scorePct}%` }} />
                    </div>
                    <div className="hero-meta">
                      meta da release: 0.70 ·{' '}
                      {scoreData
                          ? score >= 0.70
                              ? <span className="ok">acima ✓</span>
                              : <span className="fail">abaixo ✗</span>
                          : '—'}
                    </div>
                  </div>
                </div>
            )
        )}

        <div id="chars-dashboard">
          {scoreData?.characteristics.map((c) => {
            const status = getCharStatus(c.value, c.goal);
            const mark = c.value >= c.goal ? '✓' : '~';
            return (
                <div
                    key={c.name}
                    className="char-row"
                    style={status === 'warn' ? { borderColor: '#cca70044' } : undefined}
                >
                  <i className={`ti ti-chart-dots char-icon ${status}`} />
                  <span className="char-name">{c.name}</span>
                  <span className={`char-val ${status}`}>{c.value.toFixed(2)}</span>
                  <span className="char-goal">
                meta {c.goal.toFixed(2)} {mark}
              </span>
                </div>
            );
          })}
        </div>

        <div className="pubrow">
          <button
              className="btn suc"
              id="btn-publish"
              onClick={onPublish}
              disabled={isPublishing}
          >
            {isPublishing ? (
                <>
                  <i className="ti ti-loader run-anim" /> Enviando...
                </>
            ) : (
                <>
                  <i className="ti ti-upload" /> Publicar no MSGRAM
                </>
            )}
          </button>
          <span className="pubst" id="publish-status">
          {publishStatus || 'Resultado ainda não publicado nesta sessão.'}
        </span>
        </div>
      </div>
  );
};