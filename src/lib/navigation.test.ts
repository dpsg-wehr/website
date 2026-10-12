import { describe, it, expect } from 'vitest';
import { getNavigationLinks, getFlattenedSidebarLinks, findNavigationIcon } from './navigation';

describe('Navigation Service', () => {
    it('returns default or CMS navigation links', () => {
        const links = getNavigationLinks();
        expect(Array.isArray(links)).toBe(true);
        expect(links.length).toBeGreaterThan(0);
        expect(links.some((l) => l.label === 'News')).toBe(true);
    });

    it('flattens sidebar links by unwrapping "Mehr" group', () => {
        const testLinks = [
            { label: 'News', link: '/news' },
            {
                label: 'Mehr',
                link: '',
                links: [
                    { label: 'Kontakt', link: '/pages/kontakt', Icon: 'Mail' as const },
                    { label: 'Hütte', link: 'https://example.com', Icon: 'House' as const },
                ],
            },
        ];

        const flattened = getFlattenedSidebarLinks(testLinks);
        expect(flattened.some((g) => g.label === 'Mehr')).toBe(false);
        expect(flattened.some((g) => g.label === 'Kontakt')).toBe(true);
        expect(flattened.some((g) => g.label === 'Hütte')).toBe(true);
    });

    it('finds navigation icon for direct and nested links', () => {
        const testLinks = [
            { label: 'News', link: '/news', Icon: 'News' as const },
            {
                label: 'Gruppen',
                link: '',
                links: [
                    {
                        label: 'Wölflinge',
                        link: '/pages/gruppen/woelflinge',
                        Icon: 'Lilie' as const,
                    },
                ],
            },
        ];

        expect(findNavigationIcon('/news', testLinks)).toBe('News');
        expect(findNavigationIcon('/pages/gruppen/woelflinge', testLinks)).toBe('Lilie');
        expect(findNavigationIcon('/unknown', testLinks)).toBeUndefined();
    });
});
