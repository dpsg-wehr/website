'use client';

import { useSidebar } from '@/context/SidebarContext';

export default function NavbarClient() {
    const { isOpen, toggle } = useSidebar();

    return (
        <button
            onClick={toggle}
            className="min-[840px]:hidden rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 z-50 flex flex-col justify-center items-center w-10 h-10 gap-1 group transition-colors duration-200"
            aria-label="Toggle navigation"
        >
            <span
                className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                    isOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
            />
            <span
                className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-0' : ''
                }`}
            />
            <span
                className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                    isOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
            />
        </button>
    );
}
