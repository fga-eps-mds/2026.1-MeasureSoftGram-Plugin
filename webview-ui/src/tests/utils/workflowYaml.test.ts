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

    
});