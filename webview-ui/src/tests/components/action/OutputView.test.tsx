import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {OutputView} from '../../../components/action/OutputView';
import type {LogLine} from '../../../types';
import * as helpers from '../../../utils/helpers.ts';

vi.mock('../../../utils/helpers.ts', () => ({
    escHtml: vi.fn((text: string) => text),
}));

const makeLines = (overrides: Partial<LogLine>[] = []): LogLine[] =>
    overrides.map((o, i) => ({
        time: `00:0${i}`,
        text: `linha ${i}`,
        isError: false,
        ...o,
    }));

describe('OutputView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve renderizar o estado inicial "Aguardando execução..." quando não há linhas', () => {
        render(<OutputView lines={[]}/>);
        expect(screen.getByText('Aguardando execução...')).toBeInTheDocument();
    });

    it('não deve renderizar "Aguardando execução..." quando há linhas', () => {
        render(<OutputView lines={makeLines([{text: 'algo'}])}/>);
        expect(screen.queryByText('Aguardando execução...')).not.toBeInTheDocument();
    });

    it('deve renderizar uma linha com texto e horário corretos', () => {
        const lines = makeLines([{time: '12:00', text: 'olá mundo'}]);
        render(<OutputView lines={lines}/>);
        expect(screen.getByText('12:00')).toBeInTheDocument();
        expect(screen.getByText('olá mundo')).toBeInTheDocument();
    });

    it('deve renderizar múltiplas linhas na ordem correta', () => {
        const lines = makeLines([
            {text: 'primeira'},
            {text: 'segunda'},
            {text: 'terceira'},
        ]);
        render(<OutputView lines={lines}/>);
        const spans = screen.getAllByText(/primeira|segunda|terceira/);
        expect(spans).toHaveLength(3);
        expect(spans[0]).toHaveTextContent('primeira');
        expect(spans[1]).toHaveTextContent('segunda');
        expect(spans[2]).toHaveTextContent('terceira');
    });

    it('deve lidar com texto vazio em uma linha sem quebrar', () => {
        const lines = makeLines([{text: ''}]);
        expect(() => render(<OutputView lines={lines}/>)).not.toThrow();
    });

    it('deve lidar com um grande volume de linhas sem quebrar', () => {
        const lines = makeLines(Array.from({length: 500}, (_, i) => ({text: `log ${i}`})));
        expect(() => render(<OutputView lines={lines}/>)).not.toThrow();
        expect(screen.getByText('log 0')).toBeInTheDocument();
        expect(screen.getByText('log 499')).toBeInTheDocument();
    });
});