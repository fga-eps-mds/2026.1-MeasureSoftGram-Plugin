import { describe, it, expect } from 'vitest';
import { getMissingSettings } from '../../utils/validation';

describe('getMissingSettings', () => {
    it('deve retornar lista vazia quando todos os campos obrigatórios estão preenchidos', () => {
        const settings = {
            githubToken: 'token123',
            msgramServiceToken: 'msgram123',
            productName: 'Measure',
            workflowName: 'Build',
        };
        expect(getMissingSettings(settings)).toHaveLength(0);
    });

    it('deve retornar todos os campos quando settings está vazio', () => {
        expect(getMissingSettings({})).toHaveLength(4);
    });

    it('deve retornar o campo faltante quando apenas um está ausente', () => {
        const settings = {
            msgramServiceToken: 'msgram123',
            productName: 'Measure',
            workflowName: 'Build',
        };
        const missing = getMissingSettings(settings);
        expect(missing).toHaveLength(1);
        expect(missing[0].key).toBe('githubToken');
        expect(missing[0].label).toBe('GitHub Token');
    });

    it('deve considerar campo com apenas espaços como ausente', () => {
        const settings = {
            githubToken: '   ',
            msgramServiceToken: 'msgram123',
            productName: 'Measure',
            workflowName: 'Build',
        };
        const missing = getMissingSettings(settings);
        expect(missing).toHaveLength(1);
        expect(missing[0].key).toBe('githubToken');
    });

    it('deve retornar os labels corretos para cada campo obrigatório', () => {
        const missing = getMissingSettings({});
        const labels = missing.map(f => f.label);
        expect(labels).toContain('GitHub Token');
        expect(labels).toContain('MSGRAM Service Token');
        expect(labels).toContain('Product Name');
        expect(labels).toContain('Workflow Name');
    });
});