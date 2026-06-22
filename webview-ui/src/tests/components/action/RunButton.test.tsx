import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RunButton } from '../../../components/action/RunButton';
import {userEvent} from "@testing-library/user-event/dist/cjs/setup/index.js";

describe('RunButton', () => {
    const onRun = vi.fn();

    beforeEach(() => {
        onRun.mockClear();
    });


    it('deve renderizar o botão com texto "Executar" quando não está rodando', () => {
        render(<RunButton onRun={onRun} running={false} />);
        expect(screen.getByRole('button')).toHaveTextContent('Executar');
    });

    it('deve renderizar o botão com texto "Executando..." quando está rodando', () => {
        render(<RunButton onRun={onRun} running={true} />);
        expect(screen.getByRole('button')).toHaveTextContent('Executando...');
    });

    it('deve estar habilitado quando running é false', () => {
        render(<RunButton onRun={onRun} running={false} />);
        expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('deve estar desabilitado quando running é true', () => {
        render(<RunButton onRun={onRun} running={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('deve chamar onRun ao clicar quando não está rodando', () => {
        render(<RunButton onRun={onRun} running={false} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onRun).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onRun ao clicar quando está desabilitado', async () => {
        render(<RunButton onRun={onRun} running={true} />);
        await userEvent.click(screen.getByRole('button'));
        expect(onRun).not.toHaveBeenCalled();
    });


});