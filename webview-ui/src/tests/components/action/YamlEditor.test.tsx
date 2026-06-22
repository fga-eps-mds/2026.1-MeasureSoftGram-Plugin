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

    
});