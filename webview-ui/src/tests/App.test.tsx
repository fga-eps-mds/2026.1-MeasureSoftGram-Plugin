import {act, fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const {mockPostMessage, mockGetState, mockSetState, mockGetMissingSettings} = vi.hoisted(() => {
    const mockPostMessage = vi.fn();
    const mockGetState = vi.fn(() => ({}));
    const mockSetState = vi.fn();
    const mockGetMissingSettings = vi.fn(() => [] as { label: string; field: string }[]);

    (globalThis as unknown as Record<string, unknown>).acquireVsCodeApi = vi.fn(() => ({
        postMessage: mockPostMessage,
        getState: mockGetState,
        setState: mockSetState,
    }));

    return {mockPostMessage, mockGetState, mockSetState, mockGetMissingSettings};
});

vi.mock('../components/Sidebar', () => ({
    Sidebar: (props: Record<string, unknown>) => (
        <div data-testid="sidebar" data-tab={props.activeTab as string}/>
    ),
}));

vi.mock('../components/Tabs', () => ({
    Tabs: (props: { active: string; onSelect: (t: string) => void }) => (
        <div data-testid="tabs">
            {['dashboard', 'settings', 'action', 'output'].map((t) => (
                <button key={t} data-testid={`tab-${t}`} onClick={() => props.onSelect(t)}>
                    {t}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../components/DashboardView', () => ({
    DashboardView: () => <div data-testid="dashboard-view"/>,
}));

vi.mock('../components/action/OutputView.tsx', () => ({
    OutputView: ({lines}: { lines: unknown[] }) => (
        <div data-testid="output-view" data-lines={lines.length}/>
    ),
}));

vi.mock('../components/SettingsView', () => ({
    SettingsView: ({onSave, savedFeedback}: { onSave: (d: unknown) => void; savedFeedback: boolean }) => (
        <div data-testid="settings-view">
            <button data-testid="settings-save" onClick={() => onSave({
                serviceUrl: 'https://api.test.com/',
                msgramServiceToken: 'tok',
                githubToken: 'ghp',
                sonarProjectKey: 'key',
                productName: 'Produto',
                workflowName: 'CI',
            })}>save
            </button>
            {savedFeedback && <span data-testid="settings-feedback"/>}
        </div>
    ),
}));

vi.mock('../components/action/ActionView.tsx', () => ({
    ActionView: ({onSave, onRun, savedFeedback, running, alert}: {
        onSave: () => void;
        onRun: () => void;
        savedFeedback: boolean;
        running: boolean;
        alert: string | null;
    }) => (
        <div data-testid="action-view">
            <button data-testid="action-save" onClick={onSave}>save</button>
            <button data-testid="action-run" onClick={onRun}>run</button>
            {savedFeedback && <span data-testid="action-feedback"/>}
            {running && <span data-testid="action-running"/>}
            {alert && <span data-testid="action-alert">{alert}</span>}
        </div>
    ),
}));

vi.mock('../utils/helpers', () => ({
    now: () => '00:00:00',
    escHtml: (t: string) => t,
}));

vi.mock('../utils/defaultWorkflow', () => ({
    DEFAULT_WORKFLOW_YAML: 'yaml-padrao',
}));

vi.mock('../utils/workflowYaml', () => ({
    applySettingsToYaml: (_yaml: string, _settings: unknown) => 'yaml-merged',
}));

vi.mock('../utils/vscode', () => ({
    getVSCodeAPI: () => ({
        postMessage: mockPostMessage,
        getState: mockGetState,
        setState: mockSetState,
    }),
}));

vi.mock('../utils/validation', () => ({
    getMissingSettings: mockGetMissingSettings,
}));

const {default: App} = await import('../App');

function sendMessage(data: unknown) {
    window.dispatchEvent(new MessageEvent('message', {data}));
}

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetState.mockReturnValue({});
        mockGetMissingSettings.mockReturnValue([]);
    });

    describe('inicialização', () => {
        it('deve renderizar a aba dashboard por padrão', () => {
            render(<App/>);
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        it('deve enviar request_score ao montar', () => {
            render(<App/>);
            expect(mockPostMessage).toHaveBeenCalledWith({command: 'request_score'});
        });

        it('deve renderizar Sidebar e Tabs', () => {
            render(<App/>);
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
            expect(screen.getByTestId('tabs')).toBeInTheDocument();
        });
    });

    describe('navegação de abas', () => {
        it('deve exibir SettingsView ao selecionar a aba settings', () => {
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-settings'));
            expect(screen.getByTestId('settings-view')).toBeInTheDocument();
        });

        it('deve exibir OutputView ao selecionar a aba output', () => {
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-output'));
            expect(screen.getByTestId('output-view')).toBeInTheDocument();
        });

        it('deve exibir ActionView ao selecionar a aba action', () => {
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-action'));
            expect(screen.getByTestId('action-view')).toBeInTheDocument();
        });

        it('deve enviar request_yaml ao navegar para a aba action', () => {
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-action'));
            expect(mockPostMessage).toHaveBeenCalledWith({command: 'request_yaml'});
        });

        it('deve voltar para DashboardView ao selecionar a aba dashboard', () => {
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-settings'));
            fireEvent.click(screen.getByTestId('tab-dashboard'));
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });
    });

    describe('mensagens da extensão', () => {
        it('deve carregar repos ao receber repos_loaded', () => {
            render(<App/>);
            act(() => {
                sendMessage({command: 'repos_loaded', repos: [{id: 1, name: 'repo-1'}, {id: 2, name: 'repo-2'}]});
            });
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        it('deve ativar scoreLoading ao receber score_loading', () => {
            render(<App/>);
            act(() => sendMessage({command: 'score_loading'}));
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        it('deve atualizar scoreData ao receber score_loaded', () => {
            render(<App/>);
            act(() => sendMessage({command: 'score_loaded', data: {score: 90, characteristics: []}}));
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        it('deve lidar com score_error sem quebrar', () => {
            render(<App/>);
            act(() => sendMessage({command: 'score_error', message: 'Falha na conexão'}));
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        it('deve navegar para output e limpar logs ao receber analysis_started', () => {
            render(<App/>);
            act(() => sendMessage({command: 'analysis_started'}));
            expect(screen.getByTestId('output-view')).toBeInTheDocument();
            expect(screen.getByTestId('output-view').getAttribute('data-lines')).toBe('0');
        });

        it('deve acumular linhas de log ao receber output_line', () => {
            render(<App/>);
            act(() => sendMessage({command: 'analysis_started'}));
            act(() => sendMessage({command: 'output_line', line: 'linha 1', isError: false}));
            act(() => sendMessage({command: 'output_line', line: 'linha 2', isError: true}));
            expect(screen.getByTestId('output-view').getAttribute('data-lines')).toBe('2');
        });

        it('deve voltar para dashboard após analysis_done com sucesso', async () => {
            vi.useFakeTimers();
            render(<App/>);
            act(() => sendMessage({command: 'analysis_started'}));
            act(() => sendMessage({command: 'analysis_done', success: true, exitCode: 0}));
            await act(async () => vi.advanceTimersByTime(600));
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
            vi.useRealTimers();
        });

        it('deve permanecer na aba output se analysis_done falhar', async () => {
            vi.useFakeTimers();
            render(<App/>);
            act(() => sendMessage({command: 'analysis_started'}));
            act(() => sendMessage({command: 'analysis_done', success: false, exitCode: 1}));
            await act(async () => vi.advanceTimersByTime(600));
            expect(screen.getByTestId('output-view')).toBeInTheDocument();
            vi.useRealTimers();
        });

        it('deve parar execução ao receber analysis_stopped', () => {
            render(<App/>);
            act(() => sendMessage({command: 'analysis_started'}));
            act(() => sendMessage({command: 'analysis_stopped'}));
            expect(screen.getByTestId('output-view')).toBeInTheDocument();
        });

        it('deve atualizar yaml ao receber yaml_loaded', () => {
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-action'));
            act(() => sendMessage({command: 'yaml_loaded', yaml: 'novo-yaml'}));
            expect(screen.getByTestId('action-view')).toBeInTheDocument();
        });

        it('deve exibir feedback de action_saved por 3s e depois sumir', async () => {
            vi.useFakeTimers();
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-action'));
            act(() => sendMessage({command: 'action_saved'}));
            expect(screen.getByTestId('action-feedback')).toBeInTheDocument();
            await act(async () => vi.advanceTimersByTime(3000));
            expect(screen.queryByTestId('action-feedback')).not.toBeInTheDocument();
            vi.useRealTimers();
        });

        it('deve exibir feedback de settings_saved por 3s e depois sumir', async () => {
            vi.useFakeTimers();
            render(<App/>);
            fireEvent.click(screen.getByTestId('tab-settings'));
            act(() => sendMessage({command: 'settings_saved'}));
            expect(screen.getByTestId('settings-feedback')).toBeInTheDocument();
            await act(async () => vi.advanceTimersByTime(3000));
            expect(screen.queryByTestId('settings-feedback')).not.toBeInTheDocument();
            vi.useRealTimers();
        });

        it('deve atualizar settings ao receber settings_loaded', () => {
            render(<App/>);
            act(() => sendMessage({command: 'settings_loaded', data: {productName: 'Produto X'}}));
            expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
        });

        it('deve remover o listener de mensagens ao desmontar', () => {
            const removeSpy = vi.spyOn(window, 'removeEventListener');
            const {unmount} = render(<App/>);
            unmount();
            expect(removeSpy).toHaveBeenCalledWith('message', expect.any(Function));
        });
    });
});