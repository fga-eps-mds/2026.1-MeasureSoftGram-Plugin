import type {SettingsData} from '../types';

const REQUIRED_FIELDS: { key: keyof SettingsData; label: string }[] = [
    {key: 'githubToken', label: 'GitHub Token'},
    {key: 'msgramServiceToken', label: 'MSGRAM Service Token'},
    {key: 'productName', label: 'Product Name'},
    {key: 'workflowName', label: 'Workflow Name'},
];

export function getMissingSettings(
    settings: Partial<SettingsData>
): { key: string; label: string }[] {
    return REQUIRED_FIELDS.filter(
        (field) => !settings[field.key] || !settings[field.key]!.trim()
    );
}