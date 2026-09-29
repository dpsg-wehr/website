import type { RenderImageContext, RenderImageProps } from 'react-photo-album';
import type { PhotoPlus } from '@/types';

export default function PhotoRenderer(
    props: RenderImageProps,
    { photo, index }: RenderImageContext<PhotoPlus>
) {
    const isPriority = index < 4;

    return (
        <img
            {...props}
            loading={isPriority ? 'eager' : 'lazy'}
            decoding="async"
            style={{ ...props.style, cursor: 'pointer' }}
            data-lightbox="true"
            data-src={photo.lightboxSrc || props.src}
            data-alt={props.alt || ''}
            data-width={photo.width}
            data-height={photo.height}
        />
    );
}
