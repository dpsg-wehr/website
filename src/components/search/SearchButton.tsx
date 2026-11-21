'use client';

import { useState, useEffect, useSyncExternalStore, lazy, Suspense } from 'react';
import { IoSearch } from 'react-icons/io5';

const SearchModal = lazy(() => import('./SearchModal'));

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

    const preloadSearch = () => {
        import('./SearchModal').then((mod) => mod.fetchSearchIndex?.()).catch(() => {});
    };

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
                onMouseEnter={preloadSearch}
                onFocus={preloadSearch}
                className="group flex w-auto cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-left transition-all duration-100 hover:border-gray-300 min-[500px]:w-36 lg:w-44 lg:px-3 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500"
            >
                <IoSearch
                    aria-hidden="true"
                    className="shrink-0 text-lg text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-200"
                />
                <span className="sr-only min-[500px]:hidden">Suchen</span>
                <span className="hidden flex-1 truncate text-sm font-light text-gray-600 group-hover:text-gray-800 min-[500px]:inline dark:text-gray-400 dark:group-hover:text-gray-200">
                    Suchen...
                </span>
                <kbd className="hidden shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 uppercase min-[500px]:inline-flex dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {isMac ? '⌘' : 'Ctrl'} K
                </kbd>
            </button>
            {isOpen && (
                <Suspense fallback={null}>
                    <SearchModal isOpen={isOpen} onClose={onCloseSearch} />
                </Suspense>
            )}
        </>
    );
}
