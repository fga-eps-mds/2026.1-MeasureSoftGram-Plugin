import { describe, it, expect } from 'vitest';
import { now, escHtml, getCharStatus, getStatusColor, colorizeYaml } from '../../utils/helpers';

describe('helpers', () => {

    describe('now', () => {
        it('deve retornar o horário atual no formato HH:MM:SS', () => {
            const result = now();
            expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
    });


});