'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Fuse, { FuseResultMatch } from 'fuse.js';
import { IoSearch, IoClose } from 'react-icons/io5';
import { getIconFromName } from '@/lib/icons';
import { navigationLinks } from '@/lib/config';

interface SearchItem {
    title: string;
    content: string;
    slug: string;
    type: 'post' | 'page' | 'group' | 'file';
}

interface SearchResult extends SearchItem {
    matches?: readonly FuseResultMatch[];
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searchIndex, setSearchIndex] = useState<SearchItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const getIcon = (type: string, slug: string): React.ReactNode => {
        // 0. Force People icon for groups as requested
        if (type === 'group') return getIconFromName('People');

        // 1. Try to find in navigationLinks
        for (const group of navigationLinks) {
            if (group.link === slug && group.Icon) return getIconFromName(group.Icon);
            if (group.links) {
                for (const subLink of group.links) {
                    if (subLink.link === slug) return getIconFromName(subLink.Icon);
                }
            }
        }

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
        fetch('/search-index.json')
            .then((res) => res.json())
            .then((data) => setSearchIndex(data))
            .catch(() => {});
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

        const query = queryText.trim().toLowerCase();

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
            return getEditDistance(query, substring) <= 2;
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
                    className="bg-yellow-200 dark:bg-yellow-800/50 dark:text-yellow-100 rounded-sm px-0.5 font-medium"
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
                                } as FuseResultMatch;
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
                router.push(item.slug);
            }
            handleClose();
        },
        [router, handleClose]
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:pt-32">
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <IoSearch className="text-gray-400 text-xl mr-3" />
                    <input
                        ref={inputRef}
                        type="search"
                        inputMode="search"
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
                        placeholder="Suchen..."
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400"
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
                                    className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${
                                        index === activeIndex
                                            ? 'bg-gray-100 dark:bg-gray-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                    }`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    <div className="mr-4 text-gray-400 dark:text-gray-500 text-xl hidden xs:flex w-6 justify-center">
                                        {getIcon(item.type, item.slug)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1 text-base sm:text-lg">
                                            {highlightFuzzy(
                                                item.title,
                                                item.matches,
                                                'title',
                                                query
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 sm:line-clamp-2 font-light break-words">
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
                        <div className="p-10 text-center text-gray-400 font-light">
                            Tippe um zu suchen...
                        </div>
                    )}
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between text-[11px] text-gray-400">
                    <div className="flex gap-4">
                        <span>
                            <kbd className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1 rounded">
                                ↵
                            </kbd>{' '}
                            Auswählen
                        </span>
                        <span>
                            <kbd className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1 rounded">
                                ↑↓
                            </kbd>{' '}
                            Navigieren
                        </span>
                    </div>
                    <span>
                        <kbd className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-1 rounded">
                            ESC
                        </kbd>{' '}
                        Schließen
                    </span>
                </div>
            </div>
        </div>
    );
}
