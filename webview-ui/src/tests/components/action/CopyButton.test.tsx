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


});