import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {SettingsData} from '../../types';

const {mockGetState, mockSetState} = vi.hoisted(() => {
    const mockPostMessage = vi.fn();
    const mockGetState = vi.fn(() => ({}));
    const mockSetState = vi.fn();

    (globalThis as unknown as Record<string, unknown>).acquireVsCodeApi = vi.fn(() => ({
        postMessage: mockPostMessage,
        getState: mockGetState,
        setState: mockSetState,
    }));

    return {mockPostMessage, mockGetState, mockSetState};
});

const {SettingsView} = await import('../../components/SettingsView');

const DEFAULT_VALUES: SettingsData = {
    serviceUrl: 'https://msgram-api.synaptha.com/',
    msgramServiceToken: '',
    githubToken: '',
    sonarProjectKey: '',
    productName: 'measuresoftgram 2026',
    workflowName: 'Build',
};

const FULL_DATA: SettingsData = {
    serviceUrl: 'https://api.example.com/',
    msgramServiceToken: 'token-123',
    githubToken: 'ghp_abc',
    sonarProjectKey: 'my-project',
    productName: 'My Product',
    workflowName: 'CI',
};

describe('SettingsView', () => {
    const onSave = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();
        mockGetState.mockReturnValue({});

        const vscodeModule = await import('../../utils/vscode');
        (vscodeModule as unknown as Record<string, unknown>)._api = undefined;
    });

    describe('valores padrão', () => {
        it('deve renderizar o container com id "view-settings"', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            expect(document.getElementById('view-settings')).toBeInTheDocument();
        });

        it('deve preencher serviceUrl com o valor padrão quando initialData é omitido', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('https://msgram-api.synaptha.com/')).toBeInTheDocument();
        });

        it('deve preencher productName com o valor padrão quando initialData é omitido', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('measuresoftgram 2026')).toBeInTheDocument();
        });

        it('deve preencher workflowName com o valor padrão quando initialData é omitido', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('Build')).toBeInTheDocument();
        });

        it('deve renderizar campos de token como type="password"', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            expect(document.getElementById('inp-msgram-token')).toHaveAttribute('type', 'password');
            expect(document.getElementById('inp-github-token')).toHaveAttribute('type', 'password');
        });
    });

    describe('initialData', () => {
        it('deve preencher os campos com os valores de initialData', () => {
            render(<SettingsView initialData={FULL_DATA} onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('https://api.example.com/')).toBeInTheDocument();
            expect(screen.getByDisplayValue('token-123')).toBeInTheDocument();
            expect(screen.getByDisplayValue('ghp_abc')).toBeInTheDocument();
            expect(screen.getByDisplayValue('my-project')).toBeInTheDocument();
            expect(screen.getByDisplayValue('My Product')).toBeInTheDocument();
            expect(screen.getByDisplayValue('CI')).toBeInTheDocument();
        });

        it('deve dar preferência ao draft do estado sobre initialData', () => {
            mockGetState.mockReturnValue({settingsDraft: {serviceUrl: 'https://draft.com/'}});
            render(<SettingsView initialData={FULL_DATA} onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('https://draft.com/')).toBeInTheDocument();
        });
    });

    describe('edição de campos', () => {
        it.each([
            ['inp-serviceurl', 'https://nova-url.com/'],
            ['inp-msgram-token', 'novo-token'],
            ['inp-github-token', 'ghp_novo'],
            ['inp-sonar-key', 'sonar-key'],
            ['inp-product', 'Novo Produto'],
            ['inp-workflowname', 'Deploy'],
        ])('deve atualizar o campo "%s" ao digitar', (id, value) => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            const input = document.getElementById(id) as HTMLInputElement;
            fireEvent.change(input, {target: {value}});
            expect(input.value).toBe(value);
        });

        it('deve chamar setState ao alterar qualquer campo', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            fireEvent.change(document.getElementById('inp-serviceurl')!, {
                target: {value: 'https://changed.com/'},
            });
            expect(mockSetState).toHaveBeenCalled();
        });

        it('deve persistir o draft com os valores atuais ao alterar um campo', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            fireEvent.change(document.getElementById('inp-product')!, {
                target: {value: 'Produto Teste'},
            });
            const call = mockSetState.mock.calls[0][0] as Record<string, unknown>;
            expect((call.settingsDraft as SettingsData).productName).toBe('Produto Teste');
        });
    });

    describe('handleSave', () => {
        it('deve chamar onSave ao clicar no botão salvar', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            fireEvent.click(screen.getByRole('button'));
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        it('deve chamar onSave com os valores padrão quando nenhum campo foi alterado', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            fireEvent.click(screen.getByRole('button'));
            expect(onSave).toHaveBeenCalledWith(DEFAULT_VALUES);
        });

        it('deve chamar onSave com os dados atualizados após edição', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            fireEvent.change(document.getElementById('inp-product')!, {
                target: {value: 'Produto Novo'},
            });
            fireEvent.click(screen.getByRole('button'));
            expect(onSave).toHaveBeenCalledWith(expect.objectContaining({productName: 'Produto Novo'}));
        });

        it('deve chamar onSave com os valores de initialData', () => {
            render(<SettingsView initialData={FULL_DATA} onSave={onSave} savedFeedback={false}/>);
            fireEvent.click(screen.getByRole('button'));
            expect(onSave).toHaveBeenCalledWith(FULL_DATA);
        });

        it('deve chamar setState para persistir o draft ao salvar', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            fireEvent.click(screen.getByRole('button'));
            expect(mockSetState).toHaveBeenCalled();
        });
    });

    describe('savedFeedback', () => {
        it('não deve exibir o feedback quando savedFeedback é false', () => {
            render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            expect(document.getElementById('save-fb')).not.toBeInTheDocument();
        });

        it('deve exibir o feedback "Conexão validada" quando savedFeedback é true', () => {
            render(<SettingsView onSave={onSave} savedFeedback={true}/>);
            expect(document.getElementById('save-fb')).toBeInTheDocument();
            expect(screen.getByText(/Conexão validada/)).toBeInTheDocument();
        });
    });

    describe('sincronização via useEffect', () => {
        it('deve sincronizar os campos quando initialData muda de vazio para preenchido', () => {
            const {rerender} = render(<SettingsView onSave={onSave} savedFeedback={false}/>);
            rerender(<SettingsView initialData={FULL_DATA} onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('https://api.example.com/')).toBeInTheDocument();
        });

        it('não deve re-sincronizar quando initialData continua vazio', () => {
            const {rerender} = render(<SettingsView initialData={{}} onSave={onSave} savedFeedback={false}/>);
            rerender(<SettingsView initialData={{}} onSave={onSave} savedFeedback={false}/>);
            expect(screen.getByDisplayValue('https://msgram-api.synaptha.com/')).toBeInTheDocument();
        });
    });
});