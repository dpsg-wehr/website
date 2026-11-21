import type { ImageMetadata } from 'astro';

const imageFiles = import.meta.glob<{ default: ImageMetadata | string }>(
    '/src/assets/images/**/*.{png,jpg,jpeg,webp,avif,gif,svg,PNG,JPG,JPEG,WEBP}',
    { eager: true }
);

/**
 * Resolves an image path (from CMS frontmatter, MDX, or photos.json) to an Astro ImageMetadata object.
 * Supports paths like:
 * - "/media/images/sfHeader.png"
 * - "/src/assets/images/sfHeader.png"
 * - "sfHeader.png"
 * - "jurtenaktion26/flyer_square_front.jpg"
 */
export function resolveImage(path: string | null | undefined): ImageMetadata | null {
    if (!path) return null;

    // Clean leading slash and folder prefixes
    const clean = path
        .replace(/^\/?(media\/images\/|src\/assets\/images\/)/, '')
        .replace(/^\//, '');

    const targetKey = `/src/assets/images/${clean}`;

    let match: ImageMetadata | string | undefined = imageFiles[targetKey]?.default;

    if (!match) {
        // Try finding by suffix match (e.g. if path was nested or case-insensitive)
        for (const [key, module] of Object.entries(imageFiles)) {
            if (
                key.endsWith(`/${clean}`) ||
                key.toLowerCase().endsWith(`/${clean.toLowerCase()}`)
            ) {
                match = module.default;
                break;
            }
        }
    }

    if (!match) return null;

    // In Vitest or environments without Astro asset transform, image imports may be strings
    if (typeof match === 'string') {
        const ext = clean.split('.').pop()?.toLowerCase() || 'png';
        return {
            src: match,
            width: 800,
            height: 600,
            format: ext as ImageMetadata['format'],
        };
    }

    return match;
}

export function getAllImages(): Record<string, ImageMetadata | string> {
    const result: Record<string, ImageMetadata | string> = {};
    for (const [key, module] of Object.entries(imageFiles)) {
        result[key] = module.default;
    }
    return result;
}
