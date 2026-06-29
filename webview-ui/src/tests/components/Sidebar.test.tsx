import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Sidebar} from '../../components/Sidebar';

vi.mock('../../../utils/helpers', () => ({
    getCharStatus: vi.fn(() => 'ok'),
    getStatusColor: vi.fn(() => '#04724D'),
    escHtml: vi.fn((t: string) => t),
    now: vi.fn(() => '00:00:00'),
}));

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


});