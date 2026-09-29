import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GroupOverview from './GroupOverview';

describe('GroupOverview component', () => {
    const mockProps = {
        name: 'Wölflinge',
        time: 'Montag 17:45 - 19:45 Uhr',
        age: 'ca. 7 - 10 Jahre',
    };

    it('renders the group name as an h2', () => {
        render(<GroupOverview {...mockProps} />);
        const heading = screen.getByRole('heading', { level: 2, name: mockProps.name });
        expect(heading).toBeInTheDocument();
    });

    it('renders the group time and age', () => {
        render(<GroupOverview {...mockProps} />);

        expect(screen.getByText('Gruppenstunde:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.time)).toBeInTheDocument();

        expect(screen.getByText('Alter:')).toBeInTheDocument();
        expect(screen.getByText(mockProps.age)).toBeInTheDocument();
    });
});
