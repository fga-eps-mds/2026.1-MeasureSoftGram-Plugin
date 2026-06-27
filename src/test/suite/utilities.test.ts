import * as assert from 'assert';
import { getUri, getNonce } from '../../utilities/utilities';

suite('utilities', () => {

    suite('getNonce()', () => {
        test('retorna string de 32 caracteres', () => {
            assert.strictEqual(getNonce().length, 32);
        });

        test('contém apenas caracteres alfanuméricos', () => {
            assert.match(getNonce(), /^[A-Za-z0-9]{32}$/);
        });

        test('gera valores diferentes a cada chamada', () => {
            assert.notStrictEqual(getNonce(), getNonce());
        });
    });



});