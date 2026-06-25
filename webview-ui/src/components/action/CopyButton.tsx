import React, {useRef} from 'react';

interface CopyButtonProps {
    getValue: () => string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ getValue }) => {
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleCopy = () => {
        navigator.clipboard?.writeText(getValue()).catch(() => {});
        if (!btnRef.current) return;
        btnRef.current.innerHTML = '<i class="ti ti-check"></i> Copiado';
        setTimeout(() => {
            if (btnRef.current) {
                btnRef.current.innerHTML = '<i class="ti ti-copy"></i> Copiar';
            }
        }, 1500);
    };

    return (
        <button ref={btnRef} className="btn sec" onClick={handleCopy} style={{
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
            <i className="ti ti-copy" /> Copiar
        </button>
    );
};