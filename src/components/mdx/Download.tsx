import { IoAttach } from 'react-icons/io5';

export default function Download({
    src,
    title,
    filename = undefined,
}: {
    src: string;
    title: string;
    filename?: string;
}) {
    return (
        <a
            href={src}
            download={filename ? filename : title}
            className="flex flex-row items-center my-6 py-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
        >
            <IoAttach className="mx-2 text-2xl" />
            {title}
        </a>
    );
}
