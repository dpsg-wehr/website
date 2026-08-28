import { describe, it, expect } from 'vitest';
import { getExcerpt, getOptimizedImageMetadata } from './metadata';

describe('metadata utilities', () => {
    describe('getExcerpt', () => {
        it('should strip markdown and html tags', () => {
            const content = `
# Heading
This is a **bold** statement with a [link](https://example.com).
<Component>JSX content</Component>
![Image](/img.png)
Another line.
            `;
            const excerpt = getExcerpt(content);
            expect(excerpt).toBe('This is a bold statement with a link. JSX content Another line.');
        });

        it('should truncate text to the specified length at a space', () => {
            const content =
                'This is a very long sentence that should definitely be truncated at some point so that it fits into the meta description.';
            const excerpt = getExcerpt(content, 40);
            expect(excerpt).toBe('This is a very long sentence that...');
            expect(excerpt.length).toBeLessThan(45);
        });

        it('should handle short content without truncation', () => {
            const content = 'Short content.';
            const excerpt = getExcerpt(content);
            expect(excerpt).toBe('Short content.');
        });
    });

    describe('getOptimizedImageMetadata', () => {
        it('should return null for external images', () => {
            expect(getOptimizedImageMetadata('https://example.com/img.png', 100, 100)).toBeNull();
        });

        it('should return null for non-image paths', () => {
            expect(getOptimizedImageMetadata('/media/files/doc.pdf', 100, 100)).toBeNull();
        });

        it('should return optimized metadata for valid internal image paths', () => {
            const src = '/media/images/test-image.png';
            const metadata = getOptimizedImageMetadata(src, 2000, 1000);
            expect(metadata).toEqual({
                url: '/media/images/nextImageExportOptimizer/test-image-opt-1080.WEBP',
                width: 1080,
                height: 540,
            });
        });

        it('should handle nested paths correctly', () => {
            const src = '/media/images/blog/2023/cover.jpg';
            const metadata = getOptimizedImageMetadata(src, 1200, 800);
            expect(metadata?.url).toBe(
                '/media/images/blog/2023/nextImageExportOptimizer/cover-opt-1080.WEBP'
            );
        });

        it('should return null if original dimensions are missing', () => {
            expect(getOptimizedImageMetadata('/media/images/test.png', 0, 100)).toBeNull();
        });
    });
});
