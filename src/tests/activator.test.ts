import * as assert from 'assert';
import {activate} from '../activator';

suite('activator — activate()', () => {
    const subscriptions: { dispose: () => void }[] = [];
    const registeredCommands: Record<string, () => void> = {};
    const registeredProviders: Record<string, unknown> = {};
    let panelRenderCalled = false;
    let statusBarDisposeCalled = false;
    let sidebarReceivedStatusBar: unknown = null;

    suiteSetup(() => {
        const fakeContext = {subscriptions};
        const fakeVscode = {
            commands: {
                registerCommand: (id: string, fn: () => void) => {
                    registeredCommands[id] = fn;
                    return {
                        dispose: () => {
                        }
                    };
                },
            },
            window: {
                registerWebviewViewProvider: (id: string, provider: unknown) => {
                    registeredProviders[id] = provider;
                    return {
                        dispose: () => {
                        }
                    };
                },
            },
        };
        const FakePanel = {
            render: () => {
                panelRenderCalled = true;
            }
        };

        class FakeStatusBar {
            dispose() {
                statusBarDisposeCalled = true;
            }
        }

        class FakeSidebar {
            static viewType = 'msgram.sidebarView';

            constructor(_ctx: unknown, sb: unknown) {
                sidebarReceivedStatusBar = sb;
            }
        }

        activate(fakeContext, fakeVscode, FakePanel, FakeSidebar, FakeStatusBar);
    });

    test('registra o comando msgram.run', () => {
        assert.ok('msgram.run' in registeredCommands);
    });

    test('executa Panel.render ao chamar msgram.run', () => {
        registeredCommands['msgram.run']();
        assert.strictEqual(panelRenderCalled, true);
    });

    test('registra o sidebar provider com o viewType correto', () => {
        assert.ok('msgram.sidebarView' in registeredProviders);
    });

    test('instancia StatusBar e adiciona às subscriptions', () => {
        assert.ok(subscriptions.some(s => s instanceof Object && 'dispose' in s));
    });

    test('passa StatusBar para o Sidebar', () => {
        assert.ok(sidebarReceivedStatusBar !== null);
    });

    test('adiciona 3 itens às subscriptions', () => {
        assert.strictEqual(subscriptions.length, 3);
    });
});