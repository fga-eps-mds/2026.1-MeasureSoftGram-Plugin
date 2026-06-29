import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Sidebar} from '../../components/Sidebar';
import type {RepoItem, ScoreData} from '../../types';

vi.mock('../../../utils/helpers', () => ({
    getCharStatus: vi.fn(() => 'ok'),
    getStatusColor: vi.fn(() => '#04724D'),
    escHtml: vi.fn((t: string) => t),
    now: vi.fn(() => '00:00:00'),
}));

const REPOS: RepoItem[] = [
    {id: 1, name: 'repo-alpha'},
    {id: 2, name: 'repo-beta'},
];

const SCORE_DATA: ScoreData = {
    score: 0.87,
    characteristics: [
        {name: 'Reliability', value: 0.9, goal: 0.8},
        {name: 'Maintainability', value: 0.75, goal: 0.85},
    ],
};

const DEFAULT_PROPS = {
    scoreData: null,
    scoreLoading: false,
    scoreError: false,
    repos: [],
    selectedRepoPk: null,
    onSelectRepo: vi.fn(),
    activeTab: 'dashboard' as const,
    onShowTab: vi.fn(),
};

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('branding', () => {
        it('deve exibir o nome "MeasureSoftGram"', () => {
            render(<Sidebar {...DEFAULT_PROPS}/>);
            expect(screen.getByText('MeasureSoftGram')).toBeInTheDocument();
        });

        it('deve exibir o subtítulo de análise multidimensional', () => {
            render(<Sidebar {...DEFAULT_PROPS}/>);
            expect(screen.getByText(/Análise multidimensional/)).toBeInTheDocument();
        });
    });

    describe('seletor de repositório', () => {
        it('não deve renderizar o select quando não há repos', () => {
            render(<Sidebar {...DEFAULT_PROPS} repos={[]}/>);
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        it('deve renderizar o select quando há repos', () => {
            render(<Sidebar {...DEFAULT_PROPS} repos={REPOS}/>);
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('deve renderizar uma option para cada repo', () => {
            render(<Sidebar {...DEFAULT_PROPS} repos={REPOS}/>);
            expect(screen.getByRole('option', {name: 'repo-alpha'})).toBeInTheDocument();
            expect(screen.getByRole('option', {name: 'repo-beta'})).toBeInTheDocument();
        });

        it('deve refletir o repo selecionado no valor do select', () => {
            render(<Sidebar {...DEFAULT_PROPS} repos={REPOS} selectedRepoPk={2}/>);
            expect(screen.getByRole('combobox')).toHaveValue('2');
        });

        it('deve chamar onSelectRepo com o id correto ao mudar seleção', () => {
            const onSelectRepo = vi.fn();
            render(<Sidebar {...DEFAULT_PROPS} repos={REPOS} onSelectRepo={onSelectRepo}/>);
            fireEvent.change(screen.getByRole('combobox'), {target: {value: '2'}});
            expect(onSelectRepo).toHaveBeenCalledWith(2);
        });

        it('deve exibir "produto não encontrado" e desabilitar option quando scoreError', () => {
            render(<Sidebar {...DEFAULT_PROPS} repos={REPOS} scoreError={true}/>);
            const option = screen.getByRole('option', {name: 'produto não encontrado'});
            expect(option).toBeDisabled();
        });

        it('deve usar value vazio no select quando scoreError', () => {
            render(<Sidebar {...DEFAULT_PROPS} repos={REPOS} scoreError={true} selectedRepoPk={1}/>);
            expect(screen.getByRole('combobox')).toHaveValue('');
        });
    });

    describe('score', () => {
        it('deve exibir ícone de loading no score-box quando scoreLoading', () => {
            render(<Sidebar {...DEFAULT_PROPS} scoreLoading={true}/>);
            const scoreBox = document.getElementById('sb-score')!;
            expect(scoreBox.querySelector('.ti-loader')).toBeInTheDocument();
        });

        it('deve exibir o score formatado quando há dados', () => {
            render(<Sidebar {...DEFAULT_PROPS} scoreData={SCORE_DATA}/>);
            expect(document.getElementById('sb-score')).toHaveTextContent('0.87');
        });

        it('deve exibir "—" quando não há dados e não está carregando', () => {
            render(<Sidebar {...DEFAULT_PROPS} scoreData={null} scoreLoading={false}/>);
            expect(document.getElementById('sb-score')).toHaveTextContent('—');
        });

        it('deve exibir aviso de métricas não calculadas quando noData', () => {
            render(<Sidebar {...DEFAULT_PROPS} scoreData={{...SCORE_DATA, noData: true}}/>);
            expect(screen.getByText(/Métricas ainda não calculadas/)).toBeInTheDocument();
        });

        it('não deve exibir aviso de noData quando scoreLoading', () => {
            render(<Sidebar {...DEFAULT_PROPS} scoreData={{...SCORE_DATA, noData: true}} scoreLoading={true}/>);
            expect(screen.queryByText(/Métricas ainda não calculadas/)).not.toBeInTheDocument();
        });
    });


});