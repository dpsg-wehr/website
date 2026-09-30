import { useSyncExternalStore, useCallback, useState } from 'react';

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

    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const toggleOptOut = useCallback(() => {
        try {
            if (isOptedOut) {
                localStorage.removeItem('umami.disabled');
                setStatusMessage('Webanalyse wurde wieder aktiviert.');
            } else {
                localStorage.setItem('umami.disabled', '1');
                setStatusMessage(
                    'Opt-Out erfolgreich aktiviert. Tracking ist nun für diesen Browser deaktiviert.'
                );
            }
            window.dispatchEvent(new Event(STORAGE_EVENT));
        } catch {
            setStatusMessage(
                'Fehler beim Aktualisieren der Einstellungen im Speicher des Browsers.'
            );
        }
    }, [isOptedOut]);

    if (!isMounted) {
        return (
            <div
                role="region"
                aria-label="Webanalyse Opt-Out Einstellungen"
                data-testid="umami-opt-out-container"
                className={`not-prose my-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-colors ${className}`}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            Status der Webanalyse
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            Wird geprüft...
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 m-0">
                        Der aktuelle Status für diesen Browser wird ermittelt...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0 border-t border-gray-100 dark:border-gray-700/60 pt-3">
                        Hinweis: Diese Einstellung wird im lokalen Speicher (LocalStorage) Ihres
                        Browsers gespeichert. Sollten Sie Ihre Browserdaten oder Website-Daten
                        löschen, muss das Opt-Out erneut durchgeführt werden.
                    </p>
                </div>
            </div>
        );
    }

    const isTrackingBlocked = isOptedOut || isDnt;

    return (
        <div
            role="region"
            aria-label="Webanalyse Opt-Out Einstellungen"
            data-testid="umami-opt-out-container"
            className={`not-prose my-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-colors ${className}`}
        >
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        Status der Webanalyse
                    </span>
                    {isOptedOut ? (
                        <span
                            data-testid="opt-out-badge-disabled"
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300"
                        >
                            Tracking deaktiviert (Opt-Out aktiv)
                        </span>
                    ) : isDnt ? (
                        <span
                            data-testid="opt-out-badge-dnt"
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                            Do Not Track aktiv
                        </span>
                    ) : (
                        <span
                            data-testid="opt-out-badge-enabled"
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-300"
                        >
                            Tracking aktiv (anonymisiert)
                        </span>
                    )}
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    {isDevDomain && (
                        <p
                            data-testid="opt-out-dev-notice"
                            className="m-0 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg text-xs leading-relaxed border border-amber-200 dark:border-amber-900/50"
                        >
                            <strong>Hinweis (Testumgebung):</strong> Sie befinden sich auf einer
                            Entwicklungs- oder Testumgebung (
                            <code>
                                {typeof window !== 'undefined' ? window.location.hostname : ''}
                            </code>
                            ). Umami Analytics ist so konfiguriert, dass ausschließlich Besuche auf
                            der Produktionsdomain <code>dpsg-wehr.de</code> erfasst werden. Auf
                            dieser Testdomain werden daher keine Analysedaten übertragen.
                        </p>
                    )}

                    {isDnt && (
                        <p className="m-0 text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg text-xs leading-relaxed border border-blue-200 dark:border-blue-900/50">
                            <strong>Hinweis zum Browserschutz:</strong> Ihr Browser hat das Signal
                            „Do Not Track“ oder „Global Privacy Control“ aktiviert. Umami
                            respektiert dieses Signal und erfasst Ihre Besuche bereits automatisch
                            nicht.
                        </p>
                    )}

                    <p className="m-0 text-sm leading-relaxed">
                        {isTrackingBlocked || isDevDomain
                            ? 'Die Erfassung Ihrer Besuchsdaten auf dieser Website ist derzeit unterbunden.'
                            : 'Ihr Besuch wird anonymisiert und ohne Cookies erfasst, um die Website zu verbessern.'}
                    </p>
                </div>

                {statusMessage && (
                    <div
                        role="status"
                        className="text-xs p-3 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 transition-all"
                    >
                        {statusMessage}
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="button"
                        data-testid="umami-opt-out-button"
                        onClick={toggleOptOut}
                        className={`inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isOptedOut
                                ? 'bg-blue-800 text-white hover:bg-blue-900 focus:ring-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600'
                                : 'bg-red-700 text-white hover:bg-red-800 focus:ring-red-500 dark:bg-red-800 dark:hover:bg-red-700'
                        }`}
                    >
                        {isOptedOut
                            ? 'Webanalyse wieder aktivieren'
                            : 'Webanalyse für diesen Browser deaktivieren (Opt-Out)'}
                    </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 m-0 border-t border-gray-100 dark:border-gray-700/60 pt-3">
                    Hinweis: Diese Einstellung wird im lokalen Speicher (LocalStorage) Ihres
                    Browsers gespeichert. Sollten Sie Ihre Browserdaten oder Website-Daten löschen,
                    muss das Opt-Out erneut durchgeführt werden.
                </p>
            </div>
        </div>
    );
}
