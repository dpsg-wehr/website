import { PostMetadata } from '@/types';
import FloatingImage from './FloatingImage';
import { formatPostDate } from '@/lib/utils/date';

export default function Post({
    postMetadata,
    children,
    slug,
    overrideMetadata,
}: {
    postMetadata: PostMetadata[];
    children: React.ReactNode;
    slug?: string;
    overrideMetadata?: Partial<PostMetadata>;
}) {
    const foundMetadata = postMetadata.find((post) => post.slug === slug);
    const metadata = overrideMetadata
        ? ({ ...foundMetadata, ...overrideMetadata } as PostMetadata)
        : foundMetadata;

    if (!metadata) {
        return (
            <article className="prose sm:prose-lg dark:prose-invert max-w-none">{children}</article>
        );
    }

    return (
        <div>
            {metadata.image?.src && (
                <FloatingImage
                    src={metadata.image.src}
                    alt={metadata.title ?? ''}
                    width={metadata.image.width ?? 0}
                    height={metadata.image.height ?? 0}
                />
            )}
            <div className="mb-8">
                <h1 className="text-center text-4xl font-bold">{metadata.title}</h1>
                <h2 className="text-center text-xl font-light">{metadata.subtitle}</h2>
            </div>
            <p className="text-center font-light text-gray-800 dark:text-gray-200">
                {metadata.date && formatPostDate(metadata.date)}
            </p>
            <hr className="mt-3 mb-12"></hr>
            <article className="prose sm:prose-lg dark:prose-invert max-w-none">{children}</article>
        </div>
    );
}
