import fs from 'fs';

import matter from 'gray-matter';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import getPostMetadata, { clearPostMetadataCache, getPostBySlug, cleanContentSlug } from './posts';

// Setup mocking
vi.mock('fs', () => ({
    default: {
        readdirSync: vi.fn(),
        readFileSync: vi.fn(),
    },
}));

vi.mock('gray-matter');
vi.mock('image-size', () => ({
    default: vi.fn(() => ({ width: 100, height: 100 })),
}));

describe('getPostMetadata', () => {
    beforeEach(() => {
        // Clear mocks and cache to avoid leaking state
        vi.clearAllMocks();
        clearPostMetadataCache();
    });

    it('should return metadata for posts in the directory', () => {
        vi.mocked(fs.readdirSync).mockReturnValue(['first-post.mdx'] as unknown as ReturnType<
            typeof fs.readdirSync
        >);

        vi.mocked(fs.readFileSync).mockReturnValue('mocked file content');

        vi.mocked(matter).mockReturnValue({
            data: {
                title: 'First Post',
                date: '2023-01-01',
                image: 'test.jpg',
            },
        } as unknown as ReturnType<typeof matter>);

        const result = getPostMetadata();

        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('First Post');
        expect(result[0].slug).toBe('first-post');
    });

    it('should prioritize frontmatter slug over filename', () => {
        vi.mocked(fs.readdirSync).mockReturnValue(['first-post.mdx'] as unknown as ReturnType<
            typeof fs.readdirSync
        >);

        vi.mocked(fs.readFileSync).mockReturnValue('mocked file content');

        vi.mocked(matter).mockReturnValue({
            data: {
                title: 'First Post',
                date: '2023-01-01',
                slug: 'custom-post-slug',
            },
        } as unknown as ReturnType<typeof matter>);

        const result = getPostMetadata();

        expect(result).toHaveLength(1);
        expect(result[0].slug).toBe('custom-post-slug');
    });

    it('should cache posts across multiple calls unless forced', () => {
        vi.mocked(fs.readdirSync).mockReturnValue(['first-post.mdx'] as unknown as ReturnType<
            typeof fs.readdirSync
        >);
        vi.mocked(fs.readFileSync).mockReturnValue('mocked file content');
        vi.mocked(matter).mockReturnValue({
            data: {
                title: 'First Post',
                date: '2023-01-01',
            },
        } as unknown as ReturnType<typeof matter>);

        getPostMetadata();
        getPostMetadata();

        expect(fs.readdirSync).toHaveBeenCalledTimes(1);
    });

    it('getPostBySlug finds post by slug', () => {
        vi.mocked(fs.readdirSync).mockReturnValue(['my-post.mdx'] as unknown as ReturnType<
            typeof fs.readdirSync
        >);
        vi.mocked(fs.readFileSync).mockReturnValue('mocked file content');
        vi.mocked(matter).mockReturnValue({
            data: {
                title: 'Target Post',
                date: '2023-01-01',
            },
        } as unknown as ReturnType<typeof matter>);

        const found = getPostBySlug('my-post');
        expect(found?.title).toBe('Target Post');
        expect(getPostBySlug('nonexistent')).toBeUndefined();
    });

    it('cleanContentSlug removes .mdx extension', () => {
        expect(cleanContentSlug('mein-beitrag.mdx')).toBe('mein-beitrag');
        expect(cleanContentSlug('mein-beitrag')).toBe('mein-beitrag');
    });
});
