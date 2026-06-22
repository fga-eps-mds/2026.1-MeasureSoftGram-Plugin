import { describe, it, expect } from 'vitest';
import { applySettingsToYaml } from '../../utils/workflowYaml';
import { DEFAULT_WORKFLOW_YAML } from '../../utils/defaultWorkflow';

describe('applySettingsToYaml', () => {
    it('deve substituir githubToken pelo secret quando preenchido', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            githubToken: 'meu-token',
        });
        expect(result).toContain('githubToken: ${{ secrets.GITHUB_TOKEN }}');
    });

    it('deve substituir msgramServiceToken pelo secret quando preenchido', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            msgramServiceToken: 'meu-token',
        });
        expect(result).toContain('msgramServiceToken: ${{ secrets.MSGRAM_TOKEN }}');
    });

    it('deve substituir sonarProjectKey com aspas quando preenchido', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            sonarProjectKey: 'meu-projeto',
        });
        expect(result).toContain('sonarProjectKey: "meu-projeto"');
    });

    it('deve substituir productName com aspas quando preenchido', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            productName: 'meu-produto',
        });
        expect(result).toContain('productName: "meu-produto"');
    });

    it('deve substituir workflowName com aspas quando preenchido', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            workflowName: 'Build',
        });
        expect(result).toContain('workflowName: "Build"');
    });

    it('não deve substituir campo quando valor é undefined', () => {
        const original = DEFAULT_WORKFLOW_YAML;
        const result = applySettingsToYaml(original, {});
        expect(result).toBe(original);
    });

    it('deve preservar comentários da linha ao substituir', () => {
        const yaml = `        githubToken: # Token do GitHub`;
        const result = applySettingsToYaml(yaml, { githubToken: 'token' });
        expect(result).toContain('# Token do GitHub');
        expect(result).toContain('${{ secrets.GITHUB_TOKEN }}');
    });

    it('deve substituir múltiplos campos de uma vez', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            githubToken: 'token',
            productName: 'produto',
            workflowName: 'Build',
        });
        expect(result).toContain('githubToken: ${{ secrets.GITHUB_TOKEN }}');
        expect(result).toContain('productName: "produto"');
        expect(result).toContain('workflowName: "Build"');
    });

    it('deve preservar linhas não relacionadas às configurações', () => {
        const result = applySettingsToYaml(DEFAULT_WORKFLOW_YAML, {
            githubToken: 'token',
        });
        expect(result).toContain('runs-on: ubuntu-latest');
        expect(result).toContain('uses: actions/checkout@v3');
    });
});