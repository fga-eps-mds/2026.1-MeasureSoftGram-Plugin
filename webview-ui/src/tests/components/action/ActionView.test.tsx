import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActionView } from '../../../components/action/ActionView';

vi.mock('../../../components/action/YamlEditor.tsx', () => ({
    YamlEditor: ({ value, onChange }: any) => (
        <div>
            <span data-testid="yaml-value">{value}</span>
            <button
                data-testid="yaml-change"
                onClick={() => onChange('novo yaml')}
            >
                alterar
            </button>
        </div>
    ),
}));

vi.mock('../../../components/action/SaveButton.tsx', () => ({
    SaveButton: ({ onSave }: any) => (
        <button data-testid="save-button" onClick={onSave}>
            Salvar
        </button>
    ),
}));

vi.mock('../../../components/action/CopyButton.tsx', () => ({
    CopyButton: ({ getValue }: any) => (
        <button data-testid="copy-button">
            {getValue()}
        </button>
    ),
}));

vi.mock('../../../components/action/RunButton.tsx', () => ({
    RunButton: ({ onRun }: any) => (
        <button data-testid="run-button" onClick={onRun}>
            Executar
        </button>
    ),
}));

describe('ActionView', () => {
    const defaultProps = {
        yaml: 'foo: bar',
        onChange: vi.fn(),
        onSave: vi.fn(),
        savedFeedback: false,
        onRun: vi.fn(),
        running: false,
        alert: null,
    };

    it('deve renderizar a mensagem informativa', () => {
        render(<ActionView {...defaultProps} />);

        expect(
            screen.getByText(/Edite o/i)
        ).toBeInTheDocument();
    });

    it('deve renderizar o alerta quando fornecido', () => {
        render(
            <ActionView
                {...defaultProps}
                alert="Erro ao carregar YAML"
            />
        );

        expect(
            screen.getByText('Erro ao carregar YAML')
        ).toBeInTheDocument();
    });

    it('não deve renderizar alerta quando alert for null', () => {
        render(<ActionView {...defaultProps} />);

        expect(
            screen.queryByText('Erro ao carregar YAML')
        ).not.toBeInTheDocument();
    });

    it('deve renderizar o valor do yaml no editor', () => {
        render(<ActionView {...defaultProps} />);

        expect(
            screen.getByTestId('yaml-value')
        ).toHaveTextContent('foo: bar');
    });

    it('deve chamar onChange quando o editor alterar o yaml', () => {
        render(<ActionView {...defaultProps} />);

        fireEvent.click(screen.getByTestId('yaml-change'));

        expect(defaultProps.onChange)
            .toHaveBeenCalledWith('novo yaml');
    });

    it('deve chamar onSave ao clicar em salvar', () => {
        render(<ActionView {...defaultProps} />);

        fireEvent.click(screen.getByTestId('save-button'));

        expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onRun ao clicar em executar', () => {
        render(<ActionView {...defaultProps} />);

        fireEvent.click(screen.getByTestId('run-button'));

        expect(defaultProps.onRun).toHaveBeenCalledTimes(1);
    });

    it('deve passar o yaml para o CopyButton', () => {
        render(<ActionView {...defaultProps} />);

        expect(
            screen.getByTestId('copy-button')
        ).toHaveTextContent('foo: bar');
    });
});