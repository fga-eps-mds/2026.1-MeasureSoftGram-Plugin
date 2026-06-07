import React, { useState } from 'react';
import type { SettingsData } from '../types';

interface SettingsViewProps {
  initialData?: Partial<SettingsData>;
  onSave: (data: SettingsData) => void;
  savedFeedback: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  initialData = {},
  onSave,
  savedFeedback,
}) => {
  const [serviceUrl, setServiceUrl] = useState(initialData.serviceUrl ?? '');
  const [token, setToken]           = useState(initialData.token ?? '');
  const [productName, setProductName] = useState(initialData.productName ?? '');

  const handleSave = () => {
    onSave({ token, productName, serviceUrl });
  };

  return (
    <div className="vw" id="view-settings">
      <div className="sf">
        <div className="notif" style={{ marginBottom: 14 }}>
          <i className="ti ti-info-circle" />
          <span>
            Configurações salvas no workspace. Token armazenado no Secret Storage do VSCode.
          </span>
        </div>

        <div className="fg">
          <label className="fl">MSGRAM Service URL</label>
          <div className="fd">URL base da API MSGRAM (ex: https://api.msgram.io)</div>
          <input
            className="fi"
            type="text"
            id="inp-serviceurl"
            placeholder="https://api.msgram.io"
            value={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
          />
        </div>

        <div className="fg">
          <label className="fl">MSGRAM Service Token</label>
          <div className="fd">Token de autenticação da API MSGRAM</div>
          <input
            className="fi"
            type="password"
            id="inp-token"
            placeholder="••••••••••••••••"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>

        <div className="fg">
          <label className="fl">Product Name</label>
          <div className="fd">Nome do produto cadastrado no MSGRAM</div>
          <input
            className="fi"
            type="text"
            id="inp-product"
            placeholder="meu-produto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        <div className="fsave">
          <button className="btn" onClick={handleSave}>
            <i className="ti ti-device-floppy" /> Salvar e validar conexão
          </button>
          {savedFeedback && (
            <span id="save-fb" className="feedback-ok">
              <i className="ti ti-check" /> Conexão validada
            </span>
          )}
        </div>
      </div>
    </div>
  );
};