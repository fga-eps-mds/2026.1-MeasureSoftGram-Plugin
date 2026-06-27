import * as assert from 'assert';
import {getNonce, getUri} from '../../utilities/utilities';

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

    suite("getUri()", () => {
        test("retorna a URI convertida pelo webview", () => {
            const joinedUri = {scheme: "fake"} as any;
            const webviewUri = {scheme: "webview"} as any;

            const webview = {
                asWebviewUri(uri: unknown) {
                    assert.strictEqual(uri, joinedUri);
                    return webviewUri;
                },
            };

            const joinPath = (_base: any, ...paths: string[]) => {
                assert.deepStrictEqual(paths, ["media", "main.js"]);
                return joinedUri;
            };

            const result = getUri(
                webview as any,
                {} as any,
                ["media", "main.js"],
                joinPath
            );

            assert.strictEqual(result, webviewUri);
        });
    });

});