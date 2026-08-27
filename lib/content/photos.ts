import type { PhotoPlus } from '@/types';
import sizeOf from 'image-size';
import { getOptimizedUrl, getSrcSet } from '@/lib/utils/photoSrc';
import fs from 'fs';

function getImageDimensions(src: string) {
    try {
        const buffer = fs.readFileSync(`public/${src}`);
        const dimensions = sizeOf(buffer);
        return dimensions;
    } catch {
        return null;
    }
}

import photoInfo from '@/content/photos.json';

export function getPhotos(): PhotoPlus[] {
    const photos = photoInfo
        .map<PhotoPlus | undefined>((info) => {
            const dimensions = getImageDimensions(info.src);
            if (
                dimensions === null ||
                dimensions.width === undefined ||
                dimensions.height === undefined
            )
                return undefined;

            return {
                src: info.src,
                optimizedSrc: getOptimizedUrl(info.src, dimensions.width),
                width: dimensions.width,
                height: dimensions.height,
                alt: info.alt,
                srcSet: getSrcSet(info.src, dimensions.width, dimensions.height),
                tags: info.tags,
            };
        })
        .filter((photo): photo is PhotoPlus => photo !== undefined);

    return photos;
}
