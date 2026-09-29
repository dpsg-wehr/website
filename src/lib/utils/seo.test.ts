import { describe, it, expect } from 'vitest';
import {
    getSiteUrl,
    getCanonicalUrl,
    createBreadcrumbSchema,
    createOrganizationSchema,
    createBlogPostingSchema,
    createEventSchema,
    DEFAULT_SITE_URL,
} from './seo';

describe('SEO Utilities', () => {
    describe('getSiteUrl', () => {
        it('returns default site URL if undefined', () => {
            expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
            expect(getSiteUrl(null)).toBe(DEFAULT_SITE_URL);
        });

        it('trims trailing slash from URL or string', () => {
            expect(getSiteUrl('https://example.com/')).toBe('https://example.com');
            expect(getSiteUrl(new URL('https://example.com/'))).toBe('https://example.com');
        });
    });

    describe('getCanonicalUrl', () => {
        it('constructs absolute URL for path', () => {
            expect(getCanonicalUrl('/news')).toBe(`${DEFAULT_SITE_URL}/news`);
            expect(getCanonicalUrl('news')).toBe(`${DEFAULT_SITE_URL}/news`);
        });

        it('respects custom site url', () => {
            expect(getCanonicalUrl('/news', 'https://staging.dpsg-wehr.de/')).toBe(
                'https://staging.dpsg-wehr.de/news'
            );
        });
    });

    describe('createBreadcrumbSchema', () => {
        it('generates schema with 1-based positions and full URLs', () => {
            const schema = createBreadcrumbSchema(
                [
                    { name: 'Startseite', path: '/' },
                    { name: 'Aktuelles', path: '/news' },
                    { name: 'Sommerlager 2026', url: 'https://dpsg-wehr.de/posts/lager-2026' },
                ],
                'https://dpsg-wehr.de'
            );

            expect(schema['@type']).toBe('BreadcrumbList');
            expect(schema.itemListElement).toHaveLength(3);
            expect(schema.itemListElement[0]).toEqual({
                '@type': 'ListItem',
                position: 1,
                name: 'Startseite',
                item: 'https://dpsg-wehr.de/',
            });
            expect(schema.itemListElement[1]).toEqual({
                '@type': 'ListItem',
                position: 2,
                name: 'Aktuelles',
                item: 'https://dpsg-wehr.de/news',
            });
            expect(schema.itemListElement[2]).toEqual({
                '@type': 'ListItem',
                position: 3,
                name: 'Sommerlager 2026',
                item: 'https://dpsg-wehr.de/posts/lager-2026',
            });
        });
    });

    describe('createOrganizationSchema', () => {
        it('creates valid organization schema with site url', () => {
            const schema = createOrganizationSchema('https://custom.dpsg-wehr.de');
            expect(schema['@type']).toBe('NGO');
            expect(schema.url).toBe('https://custom.dpsg-wehr.de');
            expect(schema.logo).toBe('https://custom.dpsg-wehr.de/media/images/logo.png');
        });
    });

    describe('createBlogPostingSchema', () => {
        it('creates blog posting JSON-LD with correct fields', () => {
            const schema = createBlogPostingSchema({
                headline: 'Titel',
                description: 'Beschreibung',
                canonicalUrl: 'https://dpsg-wehr.de/posts/mein-post',
                imageUrl: '/media/images/bild.jpg',
                datePublished: '2026-06-01',
                author: 'Max Mustermann',
                site: 'https://dpsg-wehr.de',
            });

            expect(schema['@type']).toBe('BlogPosting');
            expect(schema.headline).toBe('Titel');
            expect(schema.image).toEqual(['https://dpsg-wehr.de/media/images/bild.jpg']);
            expect(schema.author.name).toBe('Max Mustermann');
        });
    });

    describe('createEventSchema', () => {
        it('returns null if eventData is undefined', () => {
            expect(
                createEventSchema(undefined, {
                    fallbackTitle: 'Test',
                    description: 'Desc',
                })
            ).toBeNull();
        });

        it('generates event schema when eventData is provided', () => {
            const schema = createEventSchema(
                {
                    name: 'Jurtenabend',
                    startDate: '2026-05-01',
                },
                {
                    fallbackTitle: 'Fallback',
                    description: 'Test Event',
                    site: 'https://dpsg-wehr.de',
                }
            );

            expect(schema?.['@type']).toBe('Event');
            expect(schema?.name).toBe('Jurtenabend');
            expect(schema?.startDate).toBe('2026-05-01');
        });
    });
});
