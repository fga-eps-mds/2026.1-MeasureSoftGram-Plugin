import React from 'react';
import {YamlEditor} from './YamlEditor.tsx';
import {SaveButton} from './SaveButton.tsx';
import {CopyButton} from './CopyButton.tsx';
import {RunButton} from './RunButton.tsx';

interface ActionViewProps {
    yaml: string;
    onChange: (yaml: string) => void;
    onSave: () => void;
    savedFeedback: boolean;
    onRun: () => void;
    running: boolean;
    alert?: string | null;
}

export const ActionView: React.FC<ActionViewProps> = ({
                                                          yaml,
                                                          onChange,
                                                          onSave,
                                                          savedFeedback,
                                                          onRun,
                                                          running,
                                                          alert,
                                                      }) => (
    <div className="vw" id="view-action">
        <div className="sf">
            {alert && (
                <div
                    className="notif notif-error"
                    style={{
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        background: 'rgba(244, 67, 54, 0.12)',
                        border: '1px solid rgba(244, 67, 54, 0.4)',
                        borderRadius: 6,
                        padding: '10px 12px',
                    }}
                >
                    <i className="ti ti-alert-triangle" style={{ color: '#f44336', marginTop: 2 }} />
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 16, color: '#F4F5F6' }}>
                        {alert}
                    </span>
                </div>
            )}

            <div className="notif" style={{ marginBottom: 12 }}>
                <i className="ti ti-info-circle"/>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 16, color: '#F4F5F6' }}>
                    Edite o <code style={{ color: '#9cdcfe' }}>msgram.yml</code> abaixo.
                </span>
            </div>

            <YamlEditor value={yaml} onChange={onChange}/>

            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                        <SaveButton onSave={onSave} savedFeedback={savedFeedback}/>
                    </div>
                    <div style={{ flex: 1 }}>
                        <CopyButton getValue={() => yaml}/>
                    </div>
                </div>
                <div style={{ width: '100%' }}>
                    <RunButton onRun={onRun} running={running}/>
                </div>
            </div>
        </div>
    </div>
);