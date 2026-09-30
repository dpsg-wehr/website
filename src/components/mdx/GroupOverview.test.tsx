import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GroupOverview from './GroupOverview';

describe('GroupOverview component', () => {
    const mockProps = {
        name: 'Wölflinge',
        time: 'Montag 17:45 - 19:45 Uhr',
        age: 'ca. 7 - 10 Jahre',
    };

    it('renders heading with group name', () => {
        render(<GroupOverview {...mockProps} />);
        expect(screen.getByRole('heading', { name: mockProps.name, level: 2 })).toBeInTheDocument();
    });

    it('renders time and age values', () => {
        render(<GroupOverview {...mockProps} />);
        expect(screen.getByText(mockProps.time)).toBeInTheDocument();
        expect(screen.getByText(mockProps.age)).toBeInTheDocument();
    });

    it('renders official logo for Wölflinge with colored top border', () => {
        render(<GroupOverview {...mockProps} />);
        const logo = screen.getByAltText('Wölflinge Logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/media/images/stufen/woelflinge.png');

        const card = screen.getByTestId('group-overview-card');
        expect(card).toHaveStyle({ borderTop: '4px solid #ec661a' });
    });

    it('renders official Rover Schriftzug logo for Rover', () => {
        render(
            <GroupOverview
                name="Rover"
                time="Donnerstag 19:30 - 21:00 Uhr"
                age="ca. 16 - 20 Jahre"
            />
        );
        const logo = screen.getByAltText('Rover Schriftzug Logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/media/images/stufen/rover.png');

        const card = screen.getByTestId('group-overview-card');
        expect(card).toHaveStyle({ borderTop: '4px solid #cc1e2f' });
    });

    it('renders email and description when provided', () => {
        render(
            <GroupOverview
                {...mockProps}
                email="woelflinge@dpsg-wehr.de"
                description="Gemeinsam Abenteuer erleben."
            />
        );
        const mailLink = screen.getByRole('link', { name: 'woelflinge@dpsg-wehr.de' });
        expect(mailLink).toHaveAttribute('href', 'mailto:woelflinge@dpsg-wehr.de');
        expect(screen.getByText('Gemeinsam Abenteuer erleben.')).toBeInTheDocument();
    });
});
