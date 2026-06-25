import React, { useEffect, useRef } from 'react';
import type { LogLine } from '../../types';
import { escHtml } from '../../utils/helpers.ts';

interface OutputViewProps {
  lines: LogLine[];
}

export const OutputView: React.FC<OutputViewProps> = ({ lines }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="vw" id="view-output">
      <div className="oc" id="output-log" ref={logRef}>
        {lines.length === 0 ? (
          <div className="ll">
            <span className="linfo">Aguardando execução...</span>
          </div>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="ll">
              <span className="lt">{line.time}</span>
              <span
                className={line.isError ? 'lerr' : 'lok'}
                dangerouslySetInnerHTML={{ __html: escHtml(line.text) }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
