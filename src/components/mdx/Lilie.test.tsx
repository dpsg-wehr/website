import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Lilie from './Lilie';

describe('Lilie component', () => {
    it('renders the SVG with the default color', () => {
        const { container } = render(<Lilie />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('renders the SVG with custom color', () => {
        const customColor = '#ff0000';
        const { container } = render(<Lilie color={customColor} />);
        const svg = container.querySelector('svg');

        expect(svg).toHaveAttribute('fill', customColor);
    });
});
