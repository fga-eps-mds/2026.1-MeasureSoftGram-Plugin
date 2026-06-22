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


});