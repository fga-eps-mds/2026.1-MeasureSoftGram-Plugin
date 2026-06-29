import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardView } from '../../components/DashboardView';
import type { ScoreData } from '../../types';

const mockScoreData: ScoreData = {
    score: 0.82,
    noData: false,
    characteristics: [
        { name: 'Maintainability', value: 0.85, goal: 0.80 },
        { name: 'Reliability', value: 0.60, goal: 0.75 },
        { name: 'Performance', value: 0.90, goal: 0.70 },
    ],
};

const defaultProps = {
    scoreData: mockScoreData,
    scoreLoading: false,
    productName: 'My Product',
    showCommitWarn: false,
    notifText: '',
    notifType: 'ok' as const,
};

describe('DashboardView', () => {
    describe('header', () => {
        it('deve renderizar o título MeasureSoftGram', () => {
            render(<DashboardView {...defaultProps} />);
            expect(screen.getByText(/MeasureSoftGram/i)).toBeInTheDocument();
        });

        it('deve exibir o nome do produto no subtítulo', () => {
            render(<DashboardView {...defaultProps} />);
            expect(screen.getByText(/My Product/)).toBeInTheDocument();
        });

        it('deve exibir "sem produto configurado" quando productName é vazio', () => {
            render(<DashboardView {...defaultProps} productName="" />);
            expect(screen.getByText(/sem produto configurado/)).toBeInTheDocument();
        });
    });

    describe('loading state', () => {
        it('deve exibir spinner quando scoreLoading é true', () => {
            render(<DashboardView {...defaultProps} scoreLoading={true} />);
            expect(screen.getByText(/Carregando dados do produto/i)).toBeInTheDocument();
        });

        it('não deve exibir spinner quando scoreLoading é false', () => {
            render(<DashboardView {...defaultProps} scoreLoading={false} />);
            expect(screen.queryByText(/Carregando dados do produto/i)).not.toBeInTheDocument();
        });

        it('não deve exibir o score hero durante o loading', () => {
            render(<DashboardView {...defaultProps} scoreLoading={true} />);
            expect(screen.queryByText('0.82')).not.toBeInTheDocument();
        });
    });

    describe('no data warning', () => {
        it('deve exibir aviso quando scoreData.noData é true', () => {
            const noDataScore = { ...mockScoreData, noData: true };
            render(<DashboardView {...defaultProps} scoreData={noDataScore} />);
            expect(screen.getByText(/ainda não possui métricas calculadas/i)).toBeInTheDocument();
        });

        it('não deve exibir aviso quando noData é false', () => {
            render(<DashboardView {...defaultProps} />);
            expect(screen.queryByText(/ainda não possui métricas calculadas/i)).not.toBeInTheDocument();
        });
    });

    describe('commit warning', () => {
        it('deve exibir aviso de commit com a pior característica', () => {
            render(<DashboardView {...defaultProps} showCommitWarn={true} />);

            const commitWarn = document.getElementById('commit-warn');
            expect(commitWarn).toBeInTheDocument();
            expect(commitWarn).toHaveTextContent('Reliability');
        });

        it('não deve exibir aviso de commit quando showCommitWarn é false', () => {
            render(<DashboardView {...defaultProps} showCommitWarn={false} />);
            expect(screen.queryByText(/Atenção antes do commit/i)).not.toBeInTheDocument();
        });

        it('não deve exibir aviso de commit quando scoreData é null', () => {
            render(<DashboardView {...defaultProps} scoreData={null} showCommitWarn={true} />);
            expect(screen.queryByText(/Atenção antes do commit/i)).not.toBeInTheDocument();
        });
    });
});