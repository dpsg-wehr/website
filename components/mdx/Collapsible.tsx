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
                className="flex flex-row items-center text-gray-700 dark:text-gray-300 bg-transparent border-none p-0 cursor-pointer"
                onClick={toggle}
                aria-expanded={open}
            >
                <p className="mr-2">{label}</p>
                <div className={`${open ? '' : 'transform -rotate-90'}`}>
                    <ChevronDown />
                </div>
            </button>
            <div className="pt-2">{open && children}</div>
        </div>
    );
}
