import type { APIContext } from 'astro';
import { describe, it, expect, vi } from 'vitest';

import { GET } from '@/pages/rss.xml';
import type { PostMetadata } from '@/types';

import { renderRssContent } from './rss';

vi.mock('@/lib/content/posts', () => ({
    default: vi.fn(() => [
        {
            title: 'Newer Post',
            date: '2026-05-01',
            slug: 'custom-newer',
            desc: 'Newer description',
            subtitle: '',
            author: 'Author B',
            image: { src: '/media/images/logo.png', width: 60, height: 60 },
            body: '## Subtitle\n\nFull text of newer post with [relative link](/intern) and [mailto](mailto:info@example.com).',
        },
        {
            title: 'Older Post',
            date: '2026-04-01',
            slug: 'older-post',
            desc: 'Older description',
            subtitle: '',
            author: 'Author A',
            image: { src: '', width: 0, height: 0 },
            body: 'Old text without image.',
        },
    ]),
}));

describe('RSS Feed Endpoint', () => {
    it('generates a valid RSS XML response with items and metadata', async () => {
        const context = {
            site: new URL('https://dpsg-wehr.de'),
        } as unknown as APIContext;

        const response = await GET(context);
        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(200);

        const xml = await response.text();
        expect(xml).toContain('<?xml-stylesheet href="/rss-style.xsl" type="text/xsl"?>');
        expect(xml).toContain('<title>DPSG Stamm Wehr - Aktuelles</title>');
        expect(xml).toContain('<language>de</language>');
        expect(xml).toContain('<title>Newer Post</title>');
        expect(xml).toContain('<title>Older Post</title>');
        expect(xml).toContain('<link>https://dpsg-wehr.de/posts/custom-newer/</link>');
        expect(xml).toContain('<link>https://dpsg-wehr.de/posts/older-post/</link>');
        expect(xml).toContain('<description>Newer description</description>');

        // Check full-text content:encoded presence
        expect(xml).toContain('<content:encoded>');
        expect(xml).toContain('Full text of newer post');

        // Verify descending date order (Newer Post before Older Post)
        const newerIndex = xml.indexOf('Newer Post');
        const olderIndex = xml.indexOf('Older Post');
        expect(newerIndex).toBeGreaterThan(-1);
        expect(olderIndex).toBeGreaterThan(-1);
        expect(newerIndex).toBeLessThan(olderIndex);
    });
});

describe('renderRssContent', () => {
    const siteUrl = 'https://dpsg-wehr.de';

    it('renders markdown to safe HTML with absolute links', () => {
        const post: PostMetadata = {
            title: 'Test Post',
            date: '2026-05-01',
            subtitle: '',
            author: 'Author',
            slug: 'test-post',
            desc: 'Test description',
            image: { src: '', width: 0, height: 0 },
            body: '## Heading 2\n\nParagraph with **bold** and [internal link](/news) and [external](https://google.com).',
        };

        const html = renderRssContent(post, siteUrl);
        expect(html).toContain('<h2>Heading 2</h2>');
        expect(html).toContain('<strong>bold</strong>');
        expect(html).toContain('href="https://dpsg-wehr.de/news"');
        expect(html).toContain('href="https://google.com"');
    });

    it('prepends hero image if present with absolute URL', () => {
        const post: PostMetadata = {
            title: 'Hero Image Post',
            date: '2026-05-01',
            subtitle: '',
            author: 'Author',
            slug: 'hero-post',
            desc: 'Test description',
            image: { src: '/custom/hero.jpg', width: 60, height: 60 },
            body: 'Post content here.',
        };

        const html = renderRssContent(post, siteUrl);
        expect(html).toContain('<img src="https://dpsg-wehr.de/custom/hero.jpg"');
        expect(html).toContain('alt="Hero Image Post"');
    });

    it('converts <MDXImage> components to standard <img> tags with absolute URLs', () => {
        const post: PostMetadata = {
            title: 'MDX Image Post',
            date: '2026-05-01',
            subtitle: '',
            author: 'Author',
            slug: 'mdx-img-post',
            desc: 'Test description',
            image: { src: '', width: 0, height: 0 },
            body: 'Some text before.\n\n<MDXImage src="/custom/action.png" alt="Logo image" width={200} height={100} />\n\nSome text after.',
        };

        const html = renderRssContent(post, siteUrl);
        expect(html).not.toContain('<MDXImage');
        expect(html).toContain('<img src="https://dpsg-wehr.de/custom/action.png"');
        expect(html).toContain('alt="Logo image"');
        expect(html).toContain('width="200"');
        expect(html).toContain('height="100"');
    });

    it('resolves indexed repository images via resolveImage', () => {
        const post: PostMetadata = {
            title: 'Indexed Image Post',
            date: '2026-05-01',
            subtitle: '',
            author: 'Author',
            slug: 'indexed-img-post',
            desc: 'Test description',
            image: { src: '/media/images/logo.png', width: 60, height: 60 },
            body: 'Post with logo.',
        };

        const html = renderRssContent(post, siteUrl);
        // resolveImage maps /media/images/logo.png to the asset source path
        expect(html).toContain('https://dpsg-wehr.de/src/assets/images/logo.png');
    });

    it('strips dangerous HTML scripts', () => {
        const post: PostMetadata = {
            title: 'XSS Test',
            date: '2026-05-01',
            subtitle: '',
            author: 'Author',
            slug: 'xss-post',
            desc: 'Test description',
            image: { src: '', width: 0, height: 0 },
            body: '<script>alert("hacked")</script><p>Safe text</p>',
        };

        const html = renderRssContent(post, siteUrl);
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('alert');
        expect(html).toContain('<p>Safe text</p>');
    });
});
