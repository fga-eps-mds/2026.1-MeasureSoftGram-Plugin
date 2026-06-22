import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('getVSCodeAPI', () => {
    const mockApi = {
        postMessage: vi.fn(),
        getState: vi.fn(),
        setState: vi.fn(),
    };

    beforeEach(() => {
        vi.resetModules();
        vi.stubGlobal('acquireVsCodeApi', vi.fn().mockReturnValue(mockApi));
    });

    it('deve retornar a api do vscode', async () => {
        const { getVSCodeAPI } = await import('../../utils/vscode');
        const api = getVSCodeAPI();
        expect(api).toBe(mockApi);
    });

    it('deve chamar acquireVsCodeApi apenas uma vez (singleton)', async () => {
        const { getVSCodeAPI } = await import('../../utils/vscode');
        getVSCodeAPI();
        getVSCodeAPI();
        expect(acquireVsCodeApi).toHaveBeenCalledTimes(1);
    });
});