import { describe, it, expect } from 'vitest';
import { DEFAULT_WORKFLOW_YAML } from '../../utils/defaultWorkflow';

describe('DEFAULT_WORKFLOW_YAML', () => {
    it('deve conter o nome do workflow', () => {
        expect(DEFAULT_WORKFLOW_YAML).toContain('name: MeasureSoftGram');
    });

    it('deve conter os campos configuráveis', () => {
        expect(DEFAULT_WORKFLOW_YAML).toContain('githubToken:');
        expect(DEFAULT_WORKFLOW_YAML).toContain('sonarProjectKey:');
        expect(DEFAULT_WORKFLOW_YAML).toContain('msgramServiceToken:');
        expect(DEFAULT_WORKFLOW_YAML).toContain('productName:');
        expect(DEFAULT_WORKFLOW_YAML).toContain('workflowName:');
    });

    it('deve ser uma string não vazia', () => {
        expect(DEFAULT_WORKFLOW_YAML).toBeTruthy();
        expect(typeof DEFAULT_WORKFLOW_YAML).toBe('string');
    });
});