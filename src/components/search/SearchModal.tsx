import Fuse, { FuseResultMatch } from 'fuse.js';
import { useState, useEffect, useRef, useCallback } from 'react';
import { IoSearch, IoClose } from 'react-icons/io5';

import { getIconFromName } from '@/lib/icons';
import { findNavigationIcon } from '@/lib/navigation';
import type { SearchItem } from '@/types';

interface SearchResult extends SearchItem {
    matches?: readonly FuseResultMatch[];
}

let cachedIndex: SearchItem[] | null = null;
let fetchPromise: Promise<SearchItem[]> | null = null;

export function fetchSearchIndex(): Promise<SearchItem[]> {
    if (cachedIndex) return Promise.resolve(cachedIndex);
    if (!fetchPromise) {
        fetchPromise = fetch('/search-index.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load search index');
                return res.json();
            })
            .then((data: SearchItem[]) => {
                cachedIndex = data;
                return data;
            })
            .catch((err) => {
                fetchPromise = null;
                throw err;
            });
    }
    return fetchPromise;
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const getIcon = (type: string, slug: string): React.ReactNode => {
        // 0. Force People icon for groups as requested
        if (type === 'group') return getIconFromName('People');

        // 1. Try to find in navigation
        const navIcon = findNavigationIcon(slug);
        if (navIcon) return getIconFromName(navIcon);

        // 2. Fallbacks for specific types if not in menu
        switch (type) {
            case 'post':
                return getIconFromName('News');
            case 'file':
                return getIconFromName('File');
            default:
                return null;
        }
    };

    useEffect(() => {
        let isMounted = true;
        fetchSearchIndex()
            .then((data) => {
                if (isMounted) setSearchIndex(data);
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Immediate focus for most browsers
            inputRef.current?.focus();
            // Short timeout as fallback for some mobile browsers/modal mount delays
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setQuery('');
        setResults([]);
        onClose();
    }, [onClose]);

    const highlightFuzzy = (
        text: string,
        matches: readonly FuseResultMatch[] | undefined,
        key: string,
        queryText: string
    ) => {
        if (!matches || !queryText.trim()) return text;
        const match = matches.find((m) => m.key === key);
        if (!match) return text;

        const needle = queryText.trim().toLowerCase();

        // Simple Levenshtein distance
        const getEditDistance = (a: string, b: string): number => {
            const matrix = Array.from({ length: a.length + 1 }, () => [] as number[]);
            for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
            for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
            for (let i = 1; i <= a.length; i++) {
                for (let j = 1; j <= b.length; j++) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + cost
                    );
                }
            }
            return matrix[a.length][b.length];
        };

        const targetIndices = match.indices.filter(([start, end]) => {
            const substring = text.slice(start, end + 1).toLowerCase();
            const matchLen = end - start + 1;

            // Highlight must be at least 3 letters long
            if (matchLen < 3) return false;

            // Maximum edit distance of 2
            return getEditDistance(needle, substring) <= 2;
        });

        if (targetIndices.length === 0) return text;

        const result = [];
        let lastIndex = 0;
        const sortedIndices = [...targetIndices].sort((a, b) => a[0] - b[0]);

        for (const [start, end] of sortedIndices) {
            if (start < lastIndex) continue;

            result.push(text.slice(lastIndex, start));
            result.push(
                <mark
                    key={start}
                    className="rounded-sm bg-yellow-200 px-0.5 font-medium dark:bg-yellow-800/50 dark:text-yellow-100"
                >
                    {text.slice(start, end + 1)}
                </mark>
            );
            lastIndex = end + 1;
        }
        result.push(text.slice(lastIndex));
        return result;
    };

    const handleSearch = useCallback(
        (val: string) => {
            setQuery(val);
            if (!val.trim()) {
                setResults([]);
                return;
            }

            const fuse = new Fuse(searchIndex, {
                keys: ['title', 'content'],
                threshold: 0.3,
                includeMatches: true,
                ignoreLocation: true,
            });

            const res = fuse.search(val).map((r) => {
                const item = r.item;
                let snippet = item.content;
                let finalMatches = r.matches ? [...r.matches] : [];

                if (r.matches) {
                    const contentMatch = r.matches.find((m) => m.key === 'content');
                    if (contentMatch && contentMatch.indices.length > 0) {
                        const [startIdx] = contentMatch.indices[0];
                        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                        const contextBefore = isMobile ? 20 : 80;
                        const contextAfter = isMobile ? 40 : 120;
                        const start = Math.max(0, startIdx - contextBefore);
                        const end = Math.min(item.content.length, startIdx + contextAfter);

                        snippet =
                            (start > 0 ? '...' : '') +
                            item.content.substring(start, end) +
                            (end < item.content.length ? '...' : '');

                        finalMatches = r.matches.map((m) => {
                            if (m.key === 'content') {
                                const offset = start - (start > 0 ? 3 : 0);
                                return {
                                    ...m,
                                    indices: m.indices
                                        .map(
                                            ([s, e]) => [s - offset, e - offset] as [number, number]
                                        )
                                        .filter(([s, e]) => s < snippet.length && e >= 0),
                                };
                            }
                            return m;
                        });
                    } else {
                        snippet = item.content.substring(0, 150);
                    }
                }
                return { ...item, content: snippet, matches: finalMatches };
            });

            setResults(res.slice(0, 8));
            setActiveIndex(0);
        },
        [searchIndex]
    );

    const handleSelect = useCallback(
        (item: SearchResult) => {
            if (item.type === 'file') {
                window.open(item.slug, '_blank');
            } else {
                window.location.href = item.slug;
            }
            handleClose();
        },
        [handleClose]
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }
            if (e.key === 'Enter' && results[activeIndex]) {
                handleSelect(results[activeIndex]);
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, activeIndex, handleClose, handleSelect]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-20 sm:pt-32">
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center border-b border-gray-200 p-4 dark:border-gray-700">
                    <IoSearch className="mr-3 text-xl text-gray-400" />
                    <input
                        ref={inputRef}
                        type="search"
                        inputMode="search"
                        autoFocus
                        className="flex-1 border-none bg-transparent text-lg text-gray-900 placeholder-gray-400 outline-none dark:text-white"
                        placeholder="Suchen..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <button
                        onClick={handleClose}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {results.length > 0 ? (
                        <div className="p-2">
                            {results.map((item, index) => (
                                <div
                                    key={item.slug}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                                        index === activeIndex
                                            ? 'bg-gray-100 dark:bg-gray-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div className="xs:flex mr-4 hidden w-6 justify-center text-xl text-gray-400 dark:text-gray-500">
                                        {getIcon(item.type, item.slug)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="line-clamp-1 text-base font-medium text-gray-900 sm:text-lg dark:text-white">
                                            {highlightFuzzy(
                                                item.title,
                                                item.matches,
                                                'title',
                                                query
                                            )}
                                        </h3>
                                        <p className="line-clamp-3 text-sm font-light break-words text-gray-500 sm:line-clamp-2 dark:text-gray-400">
                                            {highlightFuzzy(
                                                item.content,
                                                item.matches,
                                                'content',
                                                query
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query.trim() ? (
                        <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                            Keine Ergebnisse für &quot;{query}&quot; gefunden.
                        </div>
                    ) : (
                        <div className="p-10 text-center font-light text-gray-400">
                            Tippe um zu suchen...
                        </div>
                    )}
                </div>

                <div className="flex justify-between border-t border-gray-200 bg-gray-50 p-3 text-[11px] text-gray-400 dark:border-gray-700 dark:bg-gray-800/50">
                    <div className="flex gap-4">
                        <span>
                            <kbd className="rounded border border-gray-300 bg-white px-1 dark:border-gray-600 dark:bg-gray-700">
                                ↵
                            </kbd>{' '}
                            Auswählen
                        </span>
                        <span>
                            <kbd className="rounded border border-gray-300 bg-white px-1 dark:border-gray-600 dark:bg-gray-700">
                                ↑↓
                            </kbd>{' '}
                            Navigieren
                        </span>
                    </div>
                    <span>
                        <kbd className="rounded border border-gray-300 bg-white px-1 dark:border-gray-600 dark:bg-gray-700">
                            ESC
                        </kbd>{' '}
                        Schließen
                    </span>
                </div>
            </div>
        </div>
    );
}
