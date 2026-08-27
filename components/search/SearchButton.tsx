'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { IoSearch } from 'react-icons/io5';
import SearchModal from './SearchModal';

const emptySubscribe = () => () => {};

export default function SearchButton() {
    const [isOpen, setIsOpen] = useState(false);
    const isMac = useSyncExternalStore(
        emptySubscribe,
        () =>
            typeof navigator !== 'undefined' &&
            ((
                navigator as unknown as { userAgentData?: { platform: string } }
            ).userAgentData?.platform
                ?.toLowerCase()
                .includes('mac') ??
                /mac/i.test(navigator.platform)),
        () => false
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onOpenSearch = () => {
        setIsOpen(true);
    };

    const onCloseSearch = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={onOpenSearch}
                aria-label="Suche öffnen"
                className="group cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-100 py-1.5 px-2 lg:px-3 rounded-lg flex items-center gap-2 w-auto min-[500px]:w-36 lg:w-44 text-left"
            >
                <IoSearch className="text-gray-400 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 text-lg shrink-0" />
                <span className="hidden min-[500px]:inline flex-1 text-sm font-light text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300 truncate">
                    Suchen...
                </span>
                <kbd className="hidden min-[500px]:inline-flex px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600 uppercase shrink-0">
                    {isMac ? '⌘' : 'Ctrl'} K
                </kbd>
            </button>
            <SearchModal isOpen={isOpen} onClose={onCloseSearch} />
        </>
    );
}
