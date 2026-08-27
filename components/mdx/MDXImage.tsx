import Img from './Img';

export default function MDXImage(props: {
    src: string;
    alt: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    priority?: boolean | string;
    className?: string;
    fetchPriority?: 'high' | 'low' | 'auto';
}) {
    if (!props.src) return null;

    const isPriority = props.priority === true || props.priority === 'true';

    const w =
        typeof props.width === 'string' ? parseInt(props.width) : (props.width as number) || 800;
    const h =
        typeof props.height === 'string' ? parseInt(props.height) : (props.height as number) || 600;

    return (
        <Img
            src={props.src as string}
            alt={(props.alt || props.title || '') as string}
            width={w}
            height={h}
            id={props.src as string}
            className="object-contain h-auto max-w-full transition duration-300 drop-shadow-xl hover:drop-shadow-[0_15px_15px_rgba(0,0,0,0.35)] cursor-pointer"
            placeholder="blur"
            priority={isPriority}
            fetchPriority={props.fetchPriority}
            sizes="(max-width: 896px) 100vw, 896px"
            // We'll use these data attributes for the lightbox to pick up
            data-lightbox="true"
            data-src={props.src}
            data-alt={props.alt || props.title || ''}
            data-width={w}
            data-height={h}
        />
    );
}
