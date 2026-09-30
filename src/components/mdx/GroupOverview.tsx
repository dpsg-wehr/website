import React from 'react';
import { IoCalendarOutline, IoMailOutline } from 'react-icons/io5';

export interface GroupOverviewProps {
    name: string;
    time: string;
    age: string;
    email?: string;
    description?: string;
    logo?: string;
    color?: string;
    children?: React.ReactNode;
}

interface StufeMeta {
    color: string;
    logoPng: string;
    logoWebp: string;
    alt: string;
    isWide?: boolean;
}

const STUFEN_CONFIG: Record<string, StufeMeta> = {
    woelflinge: {
        color: '#ec661a',
        logoPng: '/media/images/stufen/woelflinge.png',
        logoWebp: '/media/images/stufen/woelflinge.webp',
        alt: 'Wölflinge Logo',
    },
    jungpfadfinder: {
        color: '#2d54a1',
        logoPng: '/media/images/stufen/jungpfadfinder.png',
        logoWebp: '/media/images/stufen/jungpfadfinder.webp',
        alt: 'Jungpfadfinder Kobold Logo',
    },
    pfadfinder: {
        color: '#08833c',
        logoPng: '/media/images/stufen/pfadfinder.png',
        logoWebp: '/media/images/stufen/pfadfinder.webp',
        alt: 'Pfadfinderstufe Logo',
    },
    rover: {
        color: '#cc1e2f',
        logoPng: '/media/images/stufen/rover.png',
        logoWebp: '/media/images/stufen/rover.webp',
        alt: 'Rover Schriftzug Logo',
        isWide: true,
    },
    leiter: {
        color: '#FFC107',
        logoPng: '/media/images/stufen/leiter.png',
        logoWebp: '/media/images/stufen/leiter.webp',
        alt: 'Leiterrunde Lilie',
    },
    biber: {
        color: '#5B2D8E',
        logoPng: '/media/images/stufen/biber.png',
        logoWebp: '/media/images/stufen/biber.webp',
        alt: 'Biber Logo',
    },
};

function getStufeMeta(name: string): StufeMeta {
    const key = name
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/[^a-z]/g, '');

    if (key.includes('woelf')) return STUFEN_CONFIG.woelflinge;
    if (key.includes('jung') || key.includes('jupfi')) return STUFEN_CONFIG.jungpfadfinder;
    if (key.includes('pfad')) return STUFEN_CONFIG.pfadfinder;
    if (key.includes('rov')) return STUFEN_CONFIG.rover;
    if (key.includes('leit')) return STUFEN_CONFIG.leiter;
    if (key.includes('bib')) return STUFEN_CONFIG.biber;
    return {
        color: '#2d54a1',
        logoPng: '',
        logoWebp: '',
        alt: name,
    };
}

export default function GroupOverview({
    name,
    time,
    age,
    email,
    description,
    logo,
    color,
    children,
}: GroupOverviewProps) {
    const meta = getStufeMeta(name);
    const accentColor = color || meta.color;
    const logoPng = logo || meta.logoPng;
    const logoWebp = logo ? logo.replace(/\.(png|jpg|jpeg)$/, '.webp') : meta.logoWebp;

    return (
        <div
            data-testid="group-overview-card"
            className="my-6 not-prose rounded-xl bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all duration-300 border border-gray-200/80 dark:border-gray-700/80 p-5 sm:p-6"
            style={{ borderTop: `4px solid ${accentColor}` }}
        >
            <div className="flex items-center gap-3.5 sm:gap-4 mb-4 pb-3.5 border-b border-gray-100 dark:border-gray-700/60">
                {logoPng ? (
                    <picture className="shrink-0 flex items-center justify-center">
                        {logoWebp && <source srcSet={logoWebp} type="image/webp" />}
                        <img
                            src={logoPng}
                            alt={meta.alt}
                            className={
                                meta.isWide
                                    ? 'h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[150px] object-contain'
                                    : 'w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-md'
                            }
                            loading="eager"
                            decoding="async"
                        />
                    </picture>
                ) : null}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white m-0 tracking-tight">
                        {name}
                    </h2>
                </div>
            </div>

            <div className="space-y-2 text-sm sm:text-base">
                <div className="text-gray-700 dark:text-gray-300 font-medium">{age}</div>

                <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <IoCalendarOutline
                        className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                    />
                    <span>{time}</span>
                </div>

                {email && (
                    <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <IoMailOutline
                            className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                        />
                        <a
                            href={`mailto:${email}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                            {email}
                        </a>
                    </div>
                )}

                {description && (
                    <p className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic m-0">
                        {description}
                    </p>
                )}

                {children && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
