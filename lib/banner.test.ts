import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveBanner } from './banner';
import getPostMetadata from '@/lib/PostMetadata';

vi.mock('@/lib/PostMetadata');
vi.mock('@/content/global/index.json', () => ({
    default: {},
}));

describe('getActiveBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when no posts have banner configured', () => {
        vi.mocked(getPostMetadata).mockReturnValue([
            {
                title: 'Test Post',
                date: '2026-08-26',
                subtitle: '',
                author: 'Linus',
                slug: 'test-post',
                image: { src: '', width: 0, height: 0 },
                desc: 'Desc',
            },
        ]);

        const banner = getActiveBanner();
        expect(banner).toBeNull();
    });

    it('resolves active banner from post frontmatter', () => {
        vi.mocked(getPostMetadata).mockReturnValue([
            {
                title: 'Scout Castle',
                date: '2026-08-26',
                subtitle: 'Jurtenaktion 2026',
                author: 'Linus',
                slug: 'scoutcastle',
                image: { src: '', width: 0, height: 0 },
                desc: 'Desc',
                banner: {
                    enabled: true,
                    until: '2026-09-13T23:59:59+02:00',
                    text: 'Jurtenaktion Scout Castle',
                    badge: 'Jurtenaktion',
                },
            },
        ]);

        const banner = getActiveBanner();
        expect(banner).not.toBeNull();
        expect(banner?.text).toBe('Jurtenaktion Scout Castle');
        expect(banner?.badge).toBe('Jurtenaktion');
        expect(banner?.link).toBe('/posts/scoutcastle');
        expect(banner?.until).toBe('2026-09-13T23:59:59+02:00');
    });

    it('normalizes date-only until format to end of day', () => {
        vi.mocked(getPostMetadata).mockReturnValue([
            {
                title: 'Post',
                date: '2026-08-26',
                subtitle: '',
                author: 'Linus',
                slug: 'post',
                image: { src: '', width: 0, height: 0 },
                desc: 'Desc',
                banner: {
                    until: '2026-09-13',
                },
            },
        ]);

        const banner = getActiveBanner();
        expect(banner).not.toBeNull();
        expect(banner?.until).toBe('2026-09-13T23:59:59+02:00');
        expect(banner?.text).toBe('Post');
    });
});
