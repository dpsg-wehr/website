'use client';

import { useState, useSyncExternalStore } from 'react';
import { HiX, HiArrowRight } from 'react-icons/hi';

import { BannerConfig } from '@/types';

function checkIsVisible(banner: BannerConfig | null): boolean {
    if (!banner) return false;
    const expiry = new Date(banner.until).getTime();
    if (Number.isNaN(expiry) || Date.now() > expiry) {
        return false;
    }
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            const dismissed = window.localStorage.getItem(`dpsg-banner-dismissed-${banner.id}`);
            if (dismissed === 'true') {
                return false;
            }
        }
    } catch {
        // Ignore localStorage errors
    }
    return true;
}

const emptySubscribe = () => () => {};

function getVariantClasses(variant?: string) {
    switch (variant) {
        case 'blue':
            return {
                aside: 'bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-blue-600/20 dark:from-blue-500/25 dark:via-indigo-500/20 dark:to-blue-500/25 backdrop-blur-md border-b border-blue-500/30 dark:border-blue-400/30 text-blue-950 dark:text-blue-100 shadow-xs',
                link: 'text-blue-950 dark:text-blue-100 hover:text-blue-700 dark:hover:text-white',
                badge: 'bg-blue-600/20 dark:bg-blue-400/20 text-blue-900 dark:text-blue-200 border border-blue-500/40 dark:border-blue-400/40 font-semibold shadow-xs',
                closeBtn:
                    'text-blue-950/60 hover:text-blue-950 dark:text-blue-200/70 dark:hover:text-white hover:bg-blue-600/20 dark:hover:bg-blue-400/20',
            };
        case 'green':
            return {
                aside: 'bg-gradient-to-r from-emerald-600/20 via-teal-600/15 to-emerald-600/20 dark:from-emerald-500/25 dark:via-teal-500/20 dark:to-emerald-500/25 backdrop-blur-md border-b border-emerald-500/30 dark:border-emerald-400/30 text-emerald-950 dark:text-emerald-100 shadow-xs',
                link: 'text-emerald-950 dark:text-emerald-100 hover:text-emerald-700 dark:hover:text-white',
                badge: 'bg-emerald-600/20 dark:bg-emerald-400/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40 dark:border-emerald-400/40 font-semibold shadow-xs',
                closeBtn:
                    'text-emerald-950/60 hover:text-emerald-950 dark:text-emerald-200/70 dark:hover:text-white hover:bg-emerald-600/20 dark:hover:bg-emerald-400/20',
            };
        case 'red':
            return {
                aside: 'bg-gradient-to-r from-red-600/20 via-rose-600/15 to-red-600/20 dark:from-red-500/25 dark:via-rose-500/20 dark:to-red-500/25 backdrop-blur-md border-b border-red-500/30 dark:border-red-400/30 text-red-950 dark:text-red-100 shadow-xs',
                link: 'text-red-950 dark:text-red-100 hover:text-red-700 dark:hover:text-white',
                badge: 'bg-red-600/20 dark:bg-red-400/20 text-red-900 dark:text-red-200 border border-red-500/40 dark:border-red-400/40 font-semibold shadow-xs',
                closeBtn:
                    'text-red-950/60 hover:text-red-950 dark:text-red-200/70 dark:hover:text-white hover:bg-red-600/20 dark:hover:bg-red-400/20',
            };
        case 'amber':
        default:
            return {
                aside: 'bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-orange-500/25 dark:from-amber-500/25 dark:via-amber-400/20 dark:to-orange-500/25 backdrop-blur-md border-b border-amber-500/40 dark:border-amber-400/30 text-amber-950 dark:text-amber-100 shadow-xs',
                link: 'text-amber-950 dark:text-amber-100 hover:text-amber-800 dark:hover:text-white',
                badge: 'bg-amber-500/25 dark:bg-amber-400/20 text-amber-950 dark:text-amber-200 border border-amber-500/40 dark:border-amber-400/40 font-semibold shadow-xs',
                closeBtn:
                    'text-amber-950/60 hover:text-amber-950 dark:text-amber-200/70 dark:hover:text-white hover:bg-amber-500/20 dark:hover:bg-amber-400/20',
            };
    }
}

export default function Banner({ banner }: { banner: BannerConfig | null }) {
    const [isDismissed, setIsDismissed] = useState(false);
    const isClientVisible = useSyncExternalStore(
        emptySubscribe,
        () => checkIsVisible(banner),
        () => false
    );

    if (!isClientVisible || isDismissed || !banner) {
        return null;
    }

    const styles = getVariantClasses(banner.variant);

    const handleDismiss = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDismissed(true);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(`dpsg-banner-dismissed-${banner.id}`, 'true');
            }
        } catch {
            // Ignore errors
        }
    };

    return (
        <aside
            data-nosnippet
            aria-label="Aktueller Hinweis"
            className={`relative z-40 transition-colors ${styles.aside}`}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-xs sm:py-2.5 sm:text-sm">
                <a
                    href={banner.link}
                    className={`group flex flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 py-0.5 text-center no-underline transition-colors ${styles.link}`}
                >
                    {banner.badge && (
                        <span
                            className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] leading-tight tracking-wider uppercase sm:text-xs ${styles.badge}`}
                        >
                            {banner.badge}
                        </span>
                    )}
                    <span className="leading-tight font-medium group-hover:underline">
                        {banner.text}
                        <span className="inline-block whitespace-nowrap">
                            &nbsp;
                            <HiArrowRight className="-mt-0.5 inline-block h-3.5 w-3.5 align-middle transition-transform duration-200 group-hover:translate-x-0.5" />
                        </span>
                    </span>
                </a>

                {banner.dismissible !== false && (
                    <button
                        onClick={handleDismiss}
                        type="button"
                        aria-label="Hinweis schließen"
                        className={`shrink-0 cursor-pointer rounded-md p-1 transition-colors ${styles.closeBtn}`}
                    >
                        <HiX className="h-4 w-4" />
                    </button>
                )}
            </div>
        </aside>
    );
}
