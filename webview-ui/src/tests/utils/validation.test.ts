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


});