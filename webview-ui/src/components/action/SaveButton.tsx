import React from 'react';

interface SaveButtonProps {
    onSave: () => void;
    savedFeedback: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({onSave, savedFeedback}) => (
    <>
        <button className="btn" onClick={onSave} style={{width: '100%', justifyContent: 'center'}}>
            <i className="ti ti-device-floppy"/> Salvar
        </button>
        {savedFeedback && (
            <span id="action-fb" className="feedback-ok">
                <i className="ti ti-check"/> Salvo no seu perfil
            </span>
        )}
    </>
);
