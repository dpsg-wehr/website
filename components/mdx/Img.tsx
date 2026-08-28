import ExportedImage, { ExportedImageProps } from 'next-image-export-optimizer';

function getSrc(src: ExportedImageProps['src']): string {
    if (typeof src === 'string') return src;
    if (src && typeof src === 'object') {
        if ('src' in src) return (src as { src: string }).src;
        if ('default' in src) return (src as { default: { src: string } }).default.src;
    }
    return '';
}

export default function Img(props: ExportedImageProps) {
    if (!props.src) return null;

    let safeSrc = props.src;

    if (
        safeSrc &&
        typeof safeSrc === 'object' &&
        'id' in safeSrc &&
        'filename' in safeSrc &&
        'src' in safeSrc
    ) {
        safeSrc = (safeSrc as { src: string }).src;
    }

    // For now, we drop the JS-based blur-up to make this a server component.
    // We can still use CSS animations if needed.
    return (
        <ExportedImage
            {...(props as ExportedImageProps)}
            src={safeSrc}
            className={`${props.className} ${!props.priority ? 'animate-unblur' : ''}`}
            // Add attributes for the lightbox to pick up
            data-lightbox="true"
            data-src={getSrc(safeSrc)}
            data-alt={props.alt}
            data-width={props.width}
            data-height={props.height}
        />
    );
}
