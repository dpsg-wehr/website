import { useSyncExternalStore, useCallback } from 'react';

interface UmamiOptOutProps {
    className?: string;
}

// Event name for in-tab localStorage changes
const STORAGE_EVENT = 'umami-opt-out-changed';

function subscribeStorage(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener(STORAGE_EVENT, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(STORAGE_EVENT, callback);
    };
}

function subscribeNoop() {
    return () => {};
}

function getIsClient() {
    return true;
}
function getIsServer() {
    return false;
}

function getOptOutSnapshot(): boolean {
    try {
        return typeof window !== 'undefined' && localStorage.getItem('umami.disabled') === '1';
    } catch {
        return false;
    }
}
function getOptOutServerSnapshot(): boolean {
    return false;
}

function getDntSnapshot(): boolean {
    try {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
        const dnt =
            navigator.doNotTrack ||
            (window as unknown as { doNotTrack?: string }).doNotTrack ||
            (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack;
        return dnt === '1' || dnt === 'yes';
    } catch {
        return false;
    }
}
function getDntServerSnapshot(): boolean {
    return false;
}

function getIsDevDomainSnapshot(): boolean {
    try {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        return Boolean(host && host !== 'dpsg-wehr.de' && host !== 'www.dpsg-wehr.de');
    } catch {
        return false;
    }
}
function getIsDevDomainServerSnapshot(): boolean {
    return false;
}

export default function UmamiOptOut({ className = '' }: UmamiOptOutProps) {
    const isMounted = useSyncExternalStore(subscribeNoop, getIsClient, getIsServer);
    const isOptedOut = useSyncExternalStore(
        subscribeStorage,
        getOptOutSnapshot,
        getOptOutServerSnapshot
    );
    const isDnt = useSyncExternalStore(subscribeNoop, getDntSnapshot, getDntServerSnapshot);
    const isDevDomain = useSyncExternalStore(
        subscribeNoop,
        getIsDevDomainSnapshot,
        getIsDevDomainServerSnapshot
    );

    const toggleOptOut = useCallback(() => {
        try {
            if (isOptedOut) {
                localStorage.removeItem('umami.disabled');
            } else {
                localStorage.setItem('umami.disabled', '1');
            }
            window.dispatchEvent(new Event(STORAGE_EVENT));
        } catch {
            // Silently ignore storage quota/security errors
        }
    }, [isOptedOut]);

    if (!isMounted) {
        return (
            <div
                role="region"
                aria-label="Webanalyse Opt-Out Einstellungen"
                data-testid="umami-opt-out-container"
                className={`not-prose my-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-xs transition-colors ${className}`}
            >
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Status der Webanalyse
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        Wird geladen...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            role="region"
            aria-label="Webanalyse Opt-Out Einstellungen"
            data-testid="umami-opt-out-container"
            className={`not-prose my-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 shadow-xs transition-colors ${className}`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            Status der Webanalyse
                        </span>
                        {isOptedOut ? (
                            <span
                                data-testid="opt-out-badge-disabled"
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Deaktiviert (Opt-Out aktiv)
                            </span>
                        ) : isDnt ? (
                            <span
                                data-testid="opt-out-badge-dnt"
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Do Not Track aktiv
                            </span>
                        ) : (
                            <span
                                data-testid="opt-out-badge-enabled"
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-300"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Aktiv (anonymisiert)
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 m-0 leading-relaxed">
                        {isOptedOut
                            ? 'Die Erfassung Ihrer Besuche ist für diesen Browser deaktiviert.'
                            : isDnt
                              ? 'Ihr Browser sendet ein Do-Not-Track-Signal. Besuche werden automatisch nicht erfasst.'
                              : 'Besuche werden ohne Cookies und anonymisiert erfasst, um die Website zu verbessern.'}
                    </p>

                    {isDevDomain && (
                        <p
                            data-testid="opt-out-dev-notice"
                            className="text-xs text-amber-700 dark:text-amber-400 m-0 italic"
                        >
                            Hinweis: Sie befinden sich auf einer Testumgebung (
                            {typeof window !== 'undefined' ? window.location.hostname : ''}). Umami
                            erfasst nur die Produktionsdomain.
                        </p>
                    )}
                </div>

                <div className="shrink-0">
                    <button
                        type="button"
                        data-testid="umami-opt-out-button"
                        onClick={toggleOptOut}
                        className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isOptedOut
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800'
                        }`}
                    >
                        {isOptedOut ? (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span>Webanalyse wieder aktivieren</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                    />
                                </svg>
                                <span>Webanalyse für diesen Browser deaktivieren (Opt-Out)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
