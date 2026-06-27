import * as assert from 'assert';
import { activate } from '../../activator';

suite('activator — activate()', () => {
    const subscriptions: { dispose: () => void }[] = [];
    const registeredCommands: Record<string, () => void> = {};
    const registeredProviders: Record<string, unknown> = {};
    let panelRenderCalled = false;

    suiteSetup(() => {
        const fakeContext = { subscriptions };
        const fakeVscode = {
            commands: {
                registerCommand: (id: string, fn: () => void) => {
                    registeredCommands[id] = fn;
                    return { dispose: () => {} };
                },
            },
            window: {
                registerWebviewViewProvider: (id: string, provider: unknown) => {
                    registeredProviders[id] = provider;
                    return { dispose: () => {} };
                },
            },
        };
        const FakePanel = { render: () => { panelRenderCalled = true; } };
        class FakeSidebar { static viewType = 'msgram.sidebarView'; constructor(_ctx: unknown) {} }

        activate(fakeContext, fakeVscode, FakePanel, FakeSidebar);
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

    test('adiciona 2 itens às subscriptions', () => {
        assert.strictEqual(subscriptions.length, 2);
    });
});