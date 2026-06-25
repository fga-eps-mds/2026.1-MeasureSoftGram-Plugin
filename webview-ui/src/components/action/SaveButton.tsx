import React from 'react';

interface SaveButtonProps {
    onSave: () => void;
    savedFeedback: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ onSave, savedFeedback }) => (
    <>
        <button className="btn" onClick={onSave} style={{
            width: '100%',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            color: '#F4F5F6',
            textAlign: 'center',
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#5f7ea3'
        }}>
            <i className="ti ti-device-floppy" /> Salvar
        </button>
        {savedFeedback && (
            <span id="action-fb" className="feedback-ok">
        <i className="ti ti-check" /> Salvo no seu perfil
      </span>
        )}
    </>
);