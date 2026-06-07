import React, { useRef, useEffect, useCallback } from 'react';
import { colorizeYaml, escHtml } from '../utils/helpers';

interface ActionViewProps {
  yaml: string;
  onChange: (yaml: string) => void;
  onSave: () => void;
  savedFeedback: boolean;
}

export const ActionView: React.FC<ActionViewProps> = ({
  yaml,
  onChange,
  onSave,
  savedFeedback,
}) => {
  const preRef    = useRef<HTMLPreElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const syncPreview = useCallback((raw: string) => {
    if (preRef.current) {
      preRef.current.innerHTML = colorizeYaml(escHtml(raw));
    }
  }, []);

  const syncScroll = useCallback(() => {
    if (editorRef.current && preRef.current) {
      preRef.current.scrollTop  = editorRef.current.scrollTop;
      preRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  }, []);

  useEffect(() => {
    syncPreview(yaml);
  }, [yaml, syncPreview]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    syncPreview(val);
    syncScroll();
  };

  const handleScroll = () => syncScroll();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el    = e.currentTarget;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const indent = '  ';
    const newVal = el.value.slice(0, start) + indent + el.value.slice(end);
    onChange(newVal);
    syncPreview(newVal);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + indent.length;
    });
  };

  const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard?.writeText(yaml).catch(() => {});
    const btn = e.currentTarget;
    btn.innerHTML = '<i class="ti ti-check"></i> Copiado';
    setTimeout(() => {
      btn.innerHTML = '<i class="ti ti-copy"></i> Copiar';
    }, 1500);
  };

  return (
    <div className="vw" id="view-action">
      <div className="sf">
        <div className="notif" style={{ marginBottom: 12 }}>
          <i className="ti ti-info-circle" />
          <span>
            Edite o <code style={{ color: '#9cdcfe' }}>msgram.yml</code> abaixo.
          </span>
        </div>

        <div className="fg">
          <label className="fl" style={{ marginBottom: 5 }}>
            <i
              className="ti ti-file-code"
              style={{ fontSize: 12, verticalAlign: '-1px', marginRight: 3 }}
            />
            msgram.yml
          </label>

          <div className="yaml-editor-shell">
            <pre
              id="yaml-preview"
              ref={preRef}
              className="yaml-editor-preview"
              aria-hidden="true"
            />
            <textarea
              id="yaml-editor"
              ref={editorRef}
              className="fi yaml-textarea"
              spellCheck={false}
              placeholder="Carregando..."
              value={yaml}
              onChange={handleInput}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="fsave" style={{ marginTop: 10, gap: 8 }}>
          <button className="btn" onClick={onSave}>
            <i className="ti ti-device-floppy" /> Salvar
          </button>
          <button className="btn sec" onClick={handleCopy}>
            <i className="ti ti-copy" /> Copiar
          </button>
          {savedFeedback && (
            <span id="action-fb" className="feedback-ok">
              <i className="ti ti-check" /> Salvo no seu perfil
            </span>
          )}
        </div>
      </div>
    </div>
  );
};