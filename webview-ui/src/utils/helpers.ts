export function now(): string {
    return new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function escHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export type StatusColor = 'ok' | 'warn' | 'fail';

export function getCharStatus(value: number, goal: number): StatusColor {
    if (value >= goal) return 'ok';
    if (value >= goal * 0.9) return 'warn';
    return 'fail';
}

export function getStatusColor(status: StatusColor): string {
    return {ok: '#4ec9b0', warn: '#cca700', fail: '#f14c4c'}[status];
}

export function colorizeYaml(escaped: string): string {
    return escaped
        .replace(/(#.*)$/gm, '<span class="yaml-cmm">$1</span>')
        .replace(/^([ \t]*)([\w-]+):/gm, '$1<span class="yaml-key">$2</span>:')
        .replace(/:\s+(&quot;.*?&quot;)/g, ': <span class="yaml-val">$1</span>')
        .replace(/:\s+(&#039;.*?&#039;)/g, ': <span class="yaml-val">$1</span>')
        .replace(/:\s+(true|false)/g, ': <span class="yaml-kw">$1</span>')
        .replace(/:\s+(\d+)/g, ': <span class="yaml-num">$1</span>')
        .replace(/(\$\{\{.*?\}\})/g, '<span class="yaml-bl">$1</span>');
}