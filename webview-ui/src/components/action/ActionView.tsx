import React from 'react';
import { YamlEditor } from './YamlEditor.tsx';
import { SaveButton } from './SaveButton.tsx';
import { CopyButton } from './CopyButton.tsx';
import { RunButton }  from './RunButton.tsx';

interface ActionViewProps {
  yaml: string;
  onChange: (yaml: string) => void;
  onSave: () => void;
  savedFeedback: boolean;
  onRun: () => void;
  running: boolean;
}

export const ActionView: React.FC<ActionViewProps> = ({
                                                        yaml,
                                                        onChange,
                                                        onSave,
                                                        savedFeedback,
                                                        onRun,
                                                        running,
                                                      }) => (
    <div className="vw" id="view-action">
      <div className="sf">
        <div className="notif" style={{ marginBottom: 12 }}>
          <i className="ti ti-info-circle" />
          <span>
            Edite o <code style={{ color: '#9cdcfe' }}>msgram.yml</code> abaixo.
          </span>
        </div>

        <YamlEditor value={yaml} onChange={onChange} />

        <div className="fsave" style={{ marginTop: 10, gap: 8 }}>
          <SaveButton onSave={onSave} savedFeedback={savedFeedback} />
          <CopyButton getValue={() => yaml} />
          <RunButton onRun={onRun} running={running} />
        </div>
      </div>
    </div>
);