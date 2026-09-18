import type { PhotoPlus } from '@/types';
import { resolveImage } from '@/lib/assets/images';
import photoInfo from '@/content/photos.json';

export function getPhotos(): PhotoPlus[] {
    const photos = photoInfo
        .map<PhotoPlus | undefined>((info) => {
            const imageMeta = resolveImage(info.src);
            if (!imageMeta) {
                return undefined;
            }

            return {
                src: imageMeta.src,
                optimizedSrc: imageMeta.src,
                width: imageMeta.width,
                height: imageMeta.height,
                alt: info.alt,
                srcSet: [
                    {
                        src: imageMeta.src,
                        width: imageMeta.width,
                        height: imageMeta.height,
                    },
                ],
                tags: info.tags,
            };
        })
        .filter((photo): photo is PhotoPlus => photo !== undefined);

    return photos;
}
