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
  const [msgramServiceToken, setMsgramServiceToken] = useState(initialData.msgramServiceToken ?? '');
  const [githubToken, setGithubToken] = useState(initialData.githubToken ?? '');
  const [sonarProjectKey, setSonarProjectKey] = useState(initialData.sonarProjectKey ?? '');
  const [productName, setProductName] = useState(initialData.productName ?? '');
  const [workflowName, setWorkflowName] = useState(initialData.workflowName ?? 'Build');

  const handleSave = () => {
    onSave({
      serviceUrl,
      msgramServiceToken,
      githubToken,
      sonarProjectKey,
      productName,
      workflowName,
    });
  };

  return (
      <div className="vw" id="view-settings">
        <div className="sf">
          <div className="notif" style={{ marginBottom: 14 }}>
            <i className="ti ti-info-circle" />
            <span>
            Configurações salvas no workspace. Tokens armazenados no Secret Storage do VSCode.
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
            <div className="fd">Token de autenticação da API MSGRAM (msgramServiceToken)</div>
            <input
                className="fi"
                type="password"
                id="inp-msgram-token"
                placeholder="••••••••••••••••"
                value={msgramServiceToken}
                onChange={(e) => setMsgramServiceToken(e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">GitHub Token</label>
            <div className="fd">Token usado pela action para acessar a API do GitHub (githubToken)</div>
            <input
                className="fi"
                type="password"
                id="inp-github-token"
                placeholder="ghp_••••••••••••••••"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">Sonar Project Key</label>
            <div className="fd">
              Chave do projeto no SonarQube (opcional, necessária se "Collect Sonarqube Metrics" estiver ativo)
            </div>
            <input
                className="fi"
                type="text"
                id="inp-sonar-key"
                placeholder="meu-projeto-sonar"
                value={sonarProjectKey}
                onChange={(e) => setSonarProjectKey(e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">Product Name</label>
            <div className="fd">Nome do produto cadastrado no MSGRAM (productName)</div>
            <input
                className="fi"
                type="text"
                id="inp-product"
                placeholder="meu-produto"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">Workflow Name</label>
            <div className="fd">
              Nome do workflow que realiza a build da release (workflowName), usado no "on: workflow_run"
            </div>
            <input
                className="fi"
                type="text"
                id="inp-workflowname"
                placeholder="Build"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
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