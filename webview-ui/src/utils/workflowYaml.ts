import type { SettingsData } from '../types';

/**
 * Atualiza, dentro do YAML, apenas as linhas dos 5 inputs configuráveis
 * (githubToken, sonarProjectKey, msgramServiceToken, productName, workflowName),
 * preservando indentação, comentários e qualquer outra edição manual no resto do arquivo.
 */
export function applySettingsToYaml(
    yaml: string,
    settings: Partial<SettingsData>
): string {
    const replacements: Record<string, string | undefined> = {
        githubToken: settings.githubToken
            ? '${{ secrets.GITHUB_TOKEN }}'
            : undefined,
        msgramServiceToken: settings.msgramServiceToken
            ? '${{ secrets.MSGRAM_TOKEN }}'
            : undefined,
        sonarProjectKey: settings.sonarProjectKey
            ? `"${settings.sonarProjectKey}"`
            : undefined,
        productName: settings.productName
            ? `"${settings.productName}"`
            : undefined,
        workflowName: settings.workflowName
            ? `"${settings.workflowName}"`
            : undefined,
    };

    const keys = Object.keys(replacements);

    const lines = yaml.split('\n').map((line) => {
        for (const key of keys) {
            const newValue = replacements[key];
            if (newValue === undefined) continue;

            const re = new RegExp(`^(\\s*)(${key}):\\s*([^#]*)?(#.*)?$`);
            const match = line.match(re);

            if (match) {
                const [, indent, matchedKey, , comment] = match;
                return `${indent}${matchedKey}: ${newValue}${comment ? ' ' + comment : ''}`;
            }
        }
        return line;
    });

    return lines.join('\n');
}