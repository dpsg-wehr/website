export interface ImgProps extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'placeholder'
> {
    src?: string | { src: string; default?: { src: string } };
    alt?: string;
    width?: number | string;
    height?: number | string;
    priority?: boolean | string;
    loading?: 'eager' | 'lazy';
    fetchPriority?: 'high' | 'low' | 'auto';
    placeholder?: string;
}

function getSrc(src: ImgProps['src']): string {
    if (typeof src === 'string') return src;
    if (src && typeof src === 'object') {
        if ('src' in src && typeof src.src === 'string') return src.src;
        if ('default' in src && src.default && 'src' in src.default) return src.default.src;
    }
    return '';
}

export default function Img({ priority, loading, placeholder: _placeholder, ...props }: ImgProps) {
    const srcStr = getSrc(props.src);
    if (!srcStr) return null;

    const isPriority = priority === true || priority === 'true' || loading === 'eager';
    const loadingAttr = isPriority ? 'eager' : loading || 'lazy';

    return (
        <img
            {...props}
            src={srcStr}
            alt={props.alt || ''}
            width={props.width}
            height={props.height}
            loading={loadingAttr}
            decoding="async"
            className={`${props.className || ''} ${!isPriority ? 'animate-unblur' : ''}`}
            data-image-component="true"
            data-lightbox="true"
            data-src={srcStr}
            data-alt={props.alt || ''}
            data-width={props.width}
            data-height={props.height}
        />
    );
}
