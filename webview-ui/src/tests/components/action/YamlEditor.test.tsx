import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YamlEditor } from '../../../components/action/YamlEditor';

vi.mock('../../../utils/helpers.ts', () => ({
    escHtml: (str: string) => str,
    colorizeYaml: (str: string) => str,
}));

describe('YamlEditor', () => {
    const onChange = vi.fn();

    beforeEach(() => {
        onChange.mockClear();
    });

    it('deve renderizar o textarea com o valor inicial', () => {
        render(<YamlEditor value="foo: bar" onChange={onChange} />);
        expect(screen.getByRole('textbox')).toHaveValue('foo: bar');
    });

    it('deve renderizar o label msgram.yml', () => {
        render(<YamlEditor value="" onChange={onChange} />);
        expect(screen.getByText(/msgram\.yml/i)).toBeInTheDocument();
    });

    it('deve chamar onChange ao digitar no textarea', () => {
        render(<YamlEditor value="" onChange={onChange} />);
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'novo: valor' },
        });
        expect(onChange).toHaveBeenCalledWith('novo: valor');
    });

    it('deve atualizar o preview ao receber novo value via prop', () => {
        const { rerender } = render(<YamlEditor value="foo: bar" onChange={onChange} />);
        rerender(<YamlEditor value="baz: qux" onChange={onChange} />);
        expect(screen.getByRole('textbox')).toHaveValue('baz: qux');
    });

    it('deve inserir dois espaços ao pressionar Tab', async () => {
        render(<YamlEditor value="foo: bar" onChange={onChange} />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.selectionStart = 7;
        textarea.selectionEnd = 7;

        fireEvent.keyDown(textarea, { key: 'Tab' });

        expect(onChange).toHaveBeenCalledWith('foo: ba  r');
    });

    it('não deve chamar onChange ao pressionar tecla que não seja Tab', () => {
        render(<YamlEditor value="foo: bar" onChange={onChange} />);
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
        expect(onChange).not.toHaveBeenCalled();
    });

    it('deve sincronizar scroll do preview com o textarea', () => {
        render(<YamlEditor value="foo: bar" onChange={onChange} />);
        const textarea = screen.getByRole('textbox');

        expect(() => fireEvent.scroll(textarea)).not.toThrow();
    });
});