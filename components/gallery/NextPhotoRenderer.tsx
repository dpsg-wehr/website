import type { RenderImageContext, RenderImageProps } from 'react-photo-album';
import Img from '@/components/mdx/Img';

export default function NextPhotoRenderer(
    { alt, title, sizes, className, style }: RenderImageProps,
    { photo }: RenderImageContext
) {
    return (
        <Img
            src={photo.src}
            placeholder={'blurDataURL' in photo ? 'blur' : undefined}
            alt={alt || ''}
            title={title}
            sizes={sizes}
            className={className}
            width={photo.width}
            height={photo.height}
            style={{ ...style, cursor: 'pointer' }}
            // Lightbox attributes
            data-lightbox="true"
            data-src={photo.src}
            data-alt={alt || title || ''}
            data-width={photo.width}
            data-height={photo.height}
        />
    );
}
