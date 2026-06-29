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
});