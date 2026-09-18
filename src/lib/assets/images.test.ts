import { describe, it, expect } from 'vitest';
import { resolveImage, getAllImages } from './images';

describe('resolveImage utility', () => {
    it('returns null for null or empty input', () => {
        expect(resolveImage(null)).toBeNull();
        expect(resolveImage(undefined)).toBeNull();
        expect(resolveImage('')).toBeNull();
    });

    it('returns null for unknown images', () => {
        expect(resolveImage('this-image-definitely-does-not-exist.xyz')).toBeNull();
    });

    it('resolves image from legacy /media/images/ path', () => {
        const result = resolveImage('/media/images/logo.png');
        expect(result).not.toBeNull();
        expect(result?.src).toBeDefined();
        expect(result?.width).toBeGreaterThan(0);
        expect(result?.height).toBeGreaterThan(0);
    });

    it('resolves image from filename only', () => {
        const result = resolveImage('logo.png');
        expect(result).not.toBeNull();
        expect(result?.src).toBeDefined();
    });

    it('resolves image from /src/assets/images/ path', () => {
        const result = resolveImage('/src/assets/images/logo.png');
        expect(result).not.toBeNull();
        expect(result?.src).toBeDefined();
    });

    it('returns all indexed images', () => {
        const all = getAllImages();
        expect(Object.keys(all).length).toBeGreaterThan(0);
    });
});
