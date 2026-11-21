import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import FooterCamp from './FooterCamp';

describe('FooterCamp', () => {
    it('renders decorative camp illustration with aria-hidden', () => {
        const { container } = render(<FooterCamp />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders tent image with webp source and png fallback', () => {
        const { container } = render(<FooterCamp />);
        const source = container.querySelector('picture source');
        expect(source).toHaveAttribute('srcset', '/images/footer/tent.webp');
        expect(source).toHaveAttribute('type', 'image/webp');

        const img = container.querySelector('picture img');
        expect(img).toHaveAttribute('src', '/images/footer/tent.png');
        expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('positions tent with dynamic grassline alignment formula', () => {
        const { container } = render(<FooterCamp />);
        const img = container.querySelector('picture img') as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.style.width).toBe('var(--tent-w)');
        expect(img.style.top).toBe('calc(14.2px - var(--tent-w) * (150 / 728))');
    });

    it('applies custom className when provided', () => {
        const { container } = render(<FooterCamp className="custom-class" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain('custom-class');
    });
});
