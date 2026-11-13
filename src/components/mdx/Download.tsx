import { IoAttach } from 'react-icons/io5';

export default function Download({
    src,
    title,
    filename,
}: {
    src: string;
    title: string;
    filename?: string;
}) {
    return (
        <a
            href={src}
            download={filename ? filename : title}
            className="my-6 flex flex-row items-center rounded-md py-2 hover:bg-gray-200 dark:hover:bg-gray-500"
        >
            <IoAttach className="mx-2 text-2xl" />
            {title}
        </a>
    );
}
