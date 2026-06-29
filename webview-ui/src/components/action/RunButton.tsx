import React from 'react';

interface RunButtonProps {
    onRun: () => void;
    running: boolean;
}

export const RunButton: React.FC<RunButtonProps> = ({onRun, running}) => (
    <button className="btn" onClick={onRun} disabled={running} style={{width: '100%', justifyContent: 'center'}}>
        <i className={`ti ${running ? 'ti-loader-2 run-anim' : 'ti-player-play'}`}/>
        {running ? ' Executando...' : ' Executar'}
    </button>
);
