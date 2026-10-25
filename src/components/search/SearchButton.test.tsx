import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchButton from './SearchButton';

// Mock SearchModal lazy component
vi.mock('./SearchModal', () => ({
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div data-testid="search-modal">
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
    fetchSearchIndex: vi.fn(),
}));

describe('SearchButton component', () => {
    it('renders search button with accessible name containing Suchen', () => {
        render(<SearchButton />);
        const button = screen.getByRole('button', { name: /suchen/i });
        expect(button).toBeInTheDocument();
    });

    it('opens modal when clicked', async () => {
        render(<SearchButton />);
        const button = screen.getByRole('button', { name: /suchen/i });
        fireEvent.click(button);

        expect(await screen.findByTestId('search-modal')).toBeInTheDocument();
    });

    it('opens modal on Cmd+K / Ctrl+K shortcut', async () => {
        render(<SearchButton />);
        fireEvent.keyDown(window, { key: 'k', metaKey: true });

        expect(await screen.findByTestId('search-modal')).toBeInTheDocument();
    });
});
