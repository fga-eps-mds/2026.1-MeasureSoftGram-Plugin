import { describe, it, expect } from 'vitest';
import { getMissingSettings } from '../../utils/validation';

describe('getMissingSettings', () => {
    it('deve retornar lista vazia quando todos os campos obrigatórios estão preenchidos', () => {
        const settings = {
            githubToken: 'token123',
            msgramServiceToken: 'msgram123',
            productName: 'meu-produto',
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
            productName: 'meu-produto',
            workflowName: 'Build',
        };
        const missing = getMissingSettings(settings);
        expect(missing).toHaveLength(1);
        expect(missing[0].key).toBe('githubToken');
        expect(missing[0].label).toBe('GitHub Token');
    });


});