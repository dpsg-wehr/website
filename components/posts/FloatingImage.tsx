import Img from '@/components/mdx/Img';
import ExportedImage from 'next-image-export-optimizer';

export default function FloatingImage({
    src,
    alt,
    width,
    height,
}: {
    src: string;
    alt: string;
    width: number;
    height: number;
}) {
    return (
        <div className="relative w-screen md:w-full -mt-8 md:mt-0 mb-8 -mx-2 sm:-mx-4 md:mx-0 overflow-hidden md:rounded-2xl shadow-none md:shadow-md md:shadow-black bg-gray-200 dark:bg-gray-800 flex justify-center items-center">
            {/* Background Blur Layer */}
            <ExportedImage
                src={src}
                alt=""
                width={width}
                height={height}
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-50 scale-105"
                priority={true}
                sizes="(max-width: 768px) 100vw, 896px"
                aria-hidden="true"
            />

            {/* Foreground Content Layer */}
            <Img
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="relative block w-full h-auto max-h-[35rem] object-contain z-10"
                priority={true}
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, 896px"
            />
        </div>
    );
}
