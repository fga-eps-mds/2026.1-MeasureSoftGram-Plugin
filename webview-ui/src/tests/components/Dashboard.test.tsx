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
});