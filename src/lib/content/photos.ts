import { getImage } from 'astro:assets';

import photoInfo from '@/content/photos.json';
import { resolveImage } from '@/lib/assets/images';
import type { PhotoPlus } from '@/types';

export async function getPhotos(): Promise<PhotoPlus[]> {
    const photos: (PhotoPlus | undefined)[] = await Promise.all(
        photoInfo.map<Promise<PhotoPlus | undefined>>(async (info) => {
            const imageMeta = resolveImage(info.src);
            if (!imageMeta) {
                return undefined;
            }

            const originalWidth = imageMeta.width || 800;
            const originalHeight = imageMeta.height || 600;

            try {
                // Responsive widths for the album grid
                const candidateWidths = [400, 800, 1200];
                const widths = candidateWidths.filter((w) => w < originalWidth);
                if (!widths.includes(originalWidth)) {
                    widths.push(originalWidth);
                }
                widths.sort((a, b) => a - b);

                const srcSet = await Promise.all(
                    widths.map(async (w) => {
                        const opt = await getImage({
                            src: imageMeta,
                            width: w,
                            format: 'webp',
                        });
                        return {
                            src: opt.src,
                            width: (opt.attributes.width as number) || w,
                            height:
                                (opt.attributes.height as number) ||
                                Math.round((w / originalWidth) * originalHeight),
                        };
                    })
                );

                // Default thumbnail
                const defaultWidth = Math.min(800, originalWidth);
                const thumb = await getImage({
                    src: imageMeta,
                    width: defaultWidth,
                    format: 'webp',
                });

                // High-res lightbox image
                const lightboxWidth = Math.min(1600, originalWidth);
                const lightbox = await getImage({
                    src: imageMeta,
                    width: lightboxWidth,
                    format: 'webp',
                });

                return {
                    src: thumb.src,
                    lightboxSrc: lightbox.src,
                    width: originalWidth,
                    height: originalHeight,
                    alt: info.alt,
                    srcSet,
                    tags: info.tags,
                };
            } catch {
                // Fallback for non-Astro build environments
                return {
                    src: imageMeta.src,
                    lightboxSrc: imageMeta.src,
                    width: originalWidth,
                    height: originalHeight,
                    alt: info.alt,
                    srcSet: [
                        {
                            src: imageMeta.src,
                            width: originalWidth,
                            height: originalHeight,
                        },
                    ],
                    tags: info.tags,
                };
            }
        })
    );

    return photos.filter((photo): photo is PhotoPlus => photo !== undefined);
}
