import React from 'react';

interface RunButtonProps {
    onRun: () => void;
    running: boolean;
}

export const RunButton: React.FC<RunButtonProps> = ({ onRun, running }) => (
    <button className="btn" onClick={onRun} disabled={running} style={{
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
        background: '#2B4D6F'
    }}>
        <i className={`ti ${running ? 'ti-loader-2' : 'ti-player-play'}`} />
        {running ? ' Executando...' : ' Executar'}
    </button>
);