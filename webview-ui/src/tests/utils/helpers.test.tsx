import { describe, it, expect } from 'vitest';
import { now, escHtml, getCharStatus, getStatusColor, colorizeYaml } from '../../utils/helpers';

describe('helpers', () => {

    describe('now', () => {
        it('deve retornar o horário atual no formato HH:MM:SS', () => {
            const result = now();
            expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('escHtml', () => {
        it('deve escapar o caractere &', () => {
            expect(escHtml('foo & bar')).toBe('foo &amp; bar');
        });

        it('deve escapar o caractere <', () => {
            expect(escHtml('<div>')).toBe('&lt;div&gt;');
        });

        it('deve escapar o caractere >', () => {
            expect(escHtml('div>')).toBe('div&gt;');
        });

        it('deve escapar múltiplos caracteres especiais juntos', () => {
            expect(escHtml('<b>foo & bar</b>')).toBe('&lt;b&gt;foo &amp; bar&lt;/b&gt;');
        });

        it('deve retornar a string intacta se não houver caracteres especiais', () => {
            expect(escHtml('foo bar')).toBe('foo bar');
        });
    });

    describe('getCharStatus', () => {
        it('deve retornar "ok" quando value >= goal', () => {
            expect(getCharStatus(10, 10)).toBe('ok');
            expect(getCharStatus(11, 10)).toBe('ok');
        });

        it('deve retornar "warn" quando value >= 90% do goal', () => {
            expect(getCharStatus(9, 10)).toBe('warn');
            expect(getCharStatus(95, 100)).toBe('warn');
        });

        it('deve retornar "fail" quando value < 90% do goal', () => {
            expect(getCharStatus(8, 10)).toBe('fail');
            expect(getCharStatus(0, 10)).toBe('fail');
        });
    });

    describe('getStatusColor', () => {
        it('deve retornar a cor correta para "ok"', () => {
            expect(getStatusColor('ok')).toBe('#4ec9b0');
        });

        it('deve retornar a cor correta para "warn"', () => {
            expect(getStatusColor('warn')).toBe('#cca700');
        });

        it('deve retornar a cor correta para "fail"', () => {
            expect(getStatusColor('fail')).toBe('#f14c4c');
        });
    });

    describe('colorizeYaml', () => {
        it('deve envolver comentários com a classe yaml-cmm', () => {
            expect(colorizeYaml('# comentario')).toContain('<span class="yaml-cmm"># comentario</span>');
        });

        it('deve envolver chaves com a classe yaml-key', () => {
            expect(colorizeYaml('foo: bar')).toContain('<span class="yaml-key">foo</span>:');
        });

        it('deve envolver valores booleanos com a classe yaml-kw', () => {
            expect(colorizeYaml('ativo: true')).toContain('<span class="yaml-kw">true</span>');
            expect(colorizeYaml('ativo: false')).toContain('<span class="yaml-kw">false</span>');
        });

        it('deve envolver valores numéricos com a classe yaml-num', () => {
            expect(colorizeYaml('porta: 8080')).toContain('<span class="yaml-num">8080</span>');
        });

        it('deve envolver expressões ${{ }} com a classe yaml-bl', () => {
            expect(colorizeYaml('${{secrets.TOKEN}}')).toContain('<span class="yaml-bl">${{secrets.TOKEN}}</span>');
        });

        it('deve retornar string vazia intacta', () => {
            expect(colorizeYaml('')).toBe('');
        });
    });
});