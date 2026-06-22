import {act, fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {CopyButton} from '../../../components/action/CopyButton';

describe('CopyButton', () => {
    const getValue = vi.fn(() => 'conteúdo copiado');

    beforeEach(() => {
        getValue.mockClear();
    });

    it('deve renderizar o botão com texto inicial "Copiar"', () => {
        render(<CopyButton getValue={getValue}/>);
        expect(screen.getByRole('button')).toHaveTextContent('Copiar');
    });

    it('deve chamar getValue e escrever no clipboard ao clicar', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, {
            clipboard: {writeText},
        });

        render(<CopyButton getValue={getValue}/>);
        fireEvent.click(screen.getByRole('button'));

        expect(getValue).toHaveBeenCalledTimes(1);
        expect(writeText).toHaveBeenCalledWith('conteúdo copiado');
    });

    it('deve mudar o texto para "Copiado" após clicar', () => {
        render(<CopyButton getValue={getValue}/>);
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('button')).toHaveTextContent('Copiado');
    });

    it('deve voltar para "Copiar" após 1500ms', async () => {
        vi.useFakeTimers();

        render(<CopyButton getValue={getValue}/>);
        fireEvent.click(screen.getByRole('button'));

        expect(screen.getByRole('button')).toHaveTextContent('Copiado');

        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        expect(screen.getByRole('button')).toHaveTextContent('Copiar');

        vi.useRealTimers();
    });

    it('não deve quebrar se clipboard não estiver disponível', () => {
        Object.assign(navigator, {clipboard: undefined});

        render(<CopyButton getValue={getValue}/>);

        expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

    it('não deve quebrar se btnRef for null no momento do reset', async () => {
        vi.useFakeTimers();

        const {unmount} = render(<CopyButton getValue={getValue}/>);
        fireEvent.click(screen.getByRole('button'));

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(1500);
        });

        vi.useRealTimers();
    });

    it('deve continuar funcionando se clipboard.writeText rejeitar', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('permission denied'));
        Object.assign(navigator, {
            clipboard: {writeText},
        });

        render(<CopyButton getValue={getValue}/>);

        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        expect(writeText).toHaveBeenCalledWith('conteúdo copiado');
        expect(screen.getByRole('button')).toHaveTextContent('Copiado');
    });
});