'use client';

import { useState } from 'react';
import { IoChevronDownOutline as ChevronDown } from 'react-icons/io5';

export default function Collapsible({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);

    const toggle = () => setOpen(!open);

    return (
        <div className="mb-2">
            <button
                type="button"
                className="flex cursor-pointer flex-row items-center border-none bg-transparent p-0 text-gray-700 dark:text-gray-300"
                onClick={toggle}
                aria-expanded={open}
            >
                <p className="mr-2">{label}</p>
                <div className={open ? '' : '-rotate-90 transform'}>
                    <ChevronDown />
                </div>
            </button>
            <div className="pt-2">{open && children}</div>
        </div>
    );
}
