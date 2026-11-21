import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import UmamiOptOut from './UmamiOptOut';

describe('UmamiOptOut component', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('renders tracking active state by default when not opted out and DNT is not set', async () => {
        render(<UmamiOptOut />);

        expect(await screen.findByTestId('opt-out-badge-enabled')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Webanalyse für diesen Browser deaktivieren (Opt-Out)',
            })
        ).toBeInTheDocument();
    });

    it('displays notice when running on a development/test domain', async () => {
        render(<UmamiOptOut />);

        expect(await screen.findByTestId('opt-out-dev-notice')).toBeInTheDocument();
        expect(screen.getByText(/Sie befinden sich auf einer Testumgebung/i)).toBeInTheDocument();
    });

    it('toggles opt-out on and off via localStorage', async () => {
        const user = userEvent.setup();
        render(<UmamiOptOut />);

        const disableButton = await screen.findByRole('button', {
            name: 'Webanalyse für diesen Browser deaktivieren (Opt-Out)',
        });

        // Click to disable tracking (Opt-Out)
        await user.click(disableButton);

        expect(localStorage.getItem('umami.disabled')).toBe('1');
        expect(screen.getByTestId('opt-out-badge-disabled')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Webanalyse wieder aktivieren' })
        ).toBeInTheDocument();

        // Click to re-enable tracking
        const enableButton = screen.getByRole('button', {
            name: 'Webanalyse wieder aktivieren',
        });
        await user.click(enableButton);

        expect(localStorage.getItem('umami.disabled')).toBeNull();
        expect(screen.getByTestId('opt-out-badge-enabled')).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Webanalyse für diesen Browser deaktivieren (Opt-Out)',
            })
        ).toBeInTheDocument();
    });

    it('detects existing opt-out from localStorage on initial render', async () => {
        localStorage.setItem('umami.disabled', '1');
        render(<UmamiOptOut />);

        expect(await screen.findByTestId('opt-out-badge-disabled')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Webanalyse wieder aktivieren' })
        ).toBeInTheDocument();
    });

    it('detects Do Not Track when active in navigator', async () => {
        const originalDnt = Object.getOwnPropertyDescriptor(navigator, 'doNotTrack');
        Object.defineProperty(navigator, 'doNotTrack', {
            value: '1',
            configurable: true,
        });

        render(<UmamiOptOut />);

        expect(await screen.findByTestId('opt-out-badge-dnt')).toBeInTheDocument();
        expect(screen.getByText(/Do Not Track/i)).toBeInTheDocument();
        expect(screen.queryByTestId('umami-opt-out-button')).not.toBeInTheDocument();

        if (originalDnt) {
            Object.defineProperty(navigator, 'doNotTrack', originalDnt);
        } else {
            Object.defineProperty(navigator, 'doNotTrack', {
                value: undefined,
                configurable: true,
            });
        }
    });
});
