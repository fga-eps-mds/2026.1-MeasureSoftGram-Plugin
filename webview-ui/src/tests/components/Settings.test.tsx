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

});