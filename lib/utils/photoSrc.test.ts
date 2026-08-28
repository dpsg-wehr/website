import { describe, it, expect } from 'vitest';
import { getOptimizedUrl, getSrcSet } from './photoSrc';

describe('photoSrc utilities', () => {
    describe('getOptimizedUrl', () => {
        it('should generate the correct optimized path for a given image and size', () => {
            const src = '/media/images/test/photo.jpg';
            const size = 640;

            const result = getOptimizedUrl(src, size);

            expect(result).toBe('/media/images/test/nextImageExportOptimizer/photo-opt-640.WEBP');
        });
    });

    describe('getSrcSet', () => {
        it('should return an array with images sources up to the size of the original image', () => {
            const src = '/media/images/test/photo.jpg';
            const width = 100;
            const height = 70;

            const result = getSrcSet(src, width, height);

            expect(result).toHaveLength(2);

            expect(result[0].width).toBe(16);
            expect(result[0].height).toBe(11);

            expect(result[1].width).toBe(64);
            expect(result[1].height).toBe(45);
        });
    });
});
