'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { IoLogoApple, IoCopy, IoCheckmark, IoDownload } from 'react-icons/io5';
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi';
import { FcGoogle } from 'react-icons/fc';
import { notFound } from 'next/navigation';

function SubscribeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'no-token'>('loading');

    useEffect(() => {
        if (!token) {
            // Use microtask to avoid synchronous setState warning
            Promise.resolve().then(() => setStatus('no-token'));
            return;
        }

        const origin = window.location.origin;
        // Check if the file exists on the server
        fetch(`${origin}/internal-events-${token}.ics`, { method: 'HEAD' })
            .then((res) => {
                setStatus(res.ok ? 'valid' : 'invalid');
            })
            .catch(() => {
                setStatus('invalid');
            });
    }, [token]);

    // Prevent hydration mismatch by not rendering anything until status is determined
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 animate-pulse text-lg">
                    Kalender wird verifiziert...
                </p>
            </div>
        );
    }

    if (status === 'invalid') {
        notFound();
    }

    if (status === 'no-token') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Fehlender Token</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Bitte benutze den vollständigen Link, den du erhalten hast.
                </p>
            </div>
        );
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const icsUrl = `${baseUrl}/internal-events-${token}.ics`;
    const webcalUrl = icsUrl.replace('https://', 'webcal://').replace('http://', 'webcal://');
    const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icsUrl)}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(icsUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4 font-handwriting text-primary-600 dark:text-primary-400">
                    Interner Kalender
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Abonniere den internen DPSG Wehr Kalender, um alle Termine (z.B. Leiterrunden)
                    automatisch auf deinem Gerät zu haben.
                </p>
            </div>

            <div className="space-y-6">
                {/* Apple / iOS */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <IoLogoApple className="text-3xl mr-3 text-gray-900 dark:text-white" />
                        <h2 className="text-xl font-semibold">iPhone, iPad & Mac</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Tippe auf den Button und bestätige das Abonnement.
                    </p>
                    <a
                        href={webcalUrl}
                        className="flex items-center justify-center w-full py-3 px-4 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-lg font-medium transition-colors"
                    >
                        <IoLogoApple className="mr-2 text-xl" />
                        Zu Apple Kalender hinzufügen
                    </a>
                </div>

                {/* Google Calendar */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <FcGoogle className="text-3xl mr-3" />
                        <h2 className="text-xl font-semibold">Google Kalender</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Fügt den Kalender direkt zu deinem Google Konto hinzu (auch für Android).
                    </p>
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-3 px-4 bg-white dark:bg-gray-100 hover:bg-gray-50 dark:hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
                    >
                        <FcGoogle className="mr-2 text-xl" />
                        Zu Google Kalender hinzufügen
                    </a>
                </div>

                {/* Manual / Outlook */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <PiMicrosoftOutlookLogoFill className="text-3xl mr-3 text-[#0078D4]" />
                        <h2 className="text-xl font-semibold">Outlook / Andere</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Nutze den Link für eine automatische Aktualisierung oder lade die Datei
                        manuell herunter.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={icsUrl}
                                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 focus:outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`w-12 flex items-center justify-center rounded-lg text-white font-medium transition-all duration-300 active:scale-90 ${
                                    copied
                                        ? 'bg-green-600 ring-2 ring-green-200 dark:ring-green-900'
                                        : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600'
                                }`}
                            >
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                    <IoCheckmark
                                        size={20}
                                        className={`absolute transition-all duration-300 transform ${
                                            copied ? 'scale-110 opacity-100' : 'scale-0 opacity-0'
                                        }`}
                                    />
                                    <IoCopy
                                        size={20}
                                        className={`absolute transition-all duration-300 transform ${
                                            copied ? 'scale-0 opacity-0' : 'scale-110 opacity-100'
                                        }`}
                                    />
                                </div>
                            </button>
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-[13px] text-amber-700 dark:text-amber-400 leading-tight">
                            <strong>Hinweis:</strong> Nur durch das Abonnieren per Link erhältst du
                            automatisch zukünftige Updates.
                        </div>

                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-wider">
                                Alternative
                            </span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        <a
                            href={icsUrl}
                            download="DPSG-Wehr-Kalender.ics"
                            className="flex items-center justify-center self-center py-2 px-4 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                        >
                            <IoDownload className="mr-2 text-lg text-gray-400" />
                            Einmaliger Download (.ics)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SubscribePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Laden...</div>}>
            <SubscribeContent />
        </Suspense>
    );
}
