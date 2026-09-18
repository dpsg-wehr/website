import Link from 'next/link';
import { PostMetadata } from '@/types';
import ExportedImage from 'next-image-export-optimizer';

interface PostPreviewProps extends PostMetadata {
    priority?: boolean;
}

export default function PostPreview(props: PostPreviewProps) {
    return (
        <article
            className="mt-4 border shadow-sm hover:shadow-lg rounded-md dark:border-gray-600 w-full max-w-md"
            key={props.slug}
        >
            <Link
                href={`/posts/${props.slug}`}
                className="flex flex-col h-full w-full no-underline"
            >
                <div className="relative aspect-video w-full overflow-hidden rounded-t-md bg-gray-200 dark:bg-gray-800">
                    {props.image.src ? (
                        <>
                            <ExportedImage
                                src={props.image.src}
                                alt=""
                                fill
                                className="object-cover blur-md opacity-50 scale-105"
                                sizes="(max-width: 768px) 50vw, 200px"
                                priority={props.priority}
                                aria-hidden="true"
                            />
                            <ExportedImage
                                src={props.image.src}
                                alt={props.title}
                                fill
                                className="object-contain z-10"
                                sizes="(max-width: 768px) 100vw, 448px"
                                priority={props.priority}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-600" />
                    )}
                </div>
                <div className="pt-3 ml-4 mr-2 mb-3 flex-1 flex flex-col">
                    <h2 className="text-xl text-gray-900 dark:text-white">{props.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 flex-1">
                        {props.desc}
                    </p>
                    <p className="text-gray-600 dark:text-gray-200 text-xs self-end mt-2">
                        {props.date}
                    </p>
                </div>
            </Link>
        </article>
    );
}
