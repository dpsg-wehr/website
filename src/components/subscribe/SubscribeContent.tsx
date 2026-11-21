import { useState, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { IoLogoApple, IoCopy, IoCheckmark, IoDownload } from 'react-icons/io5';
import { PiMicrosoftOutlookLogoFill } from 'react-icons/pi';

export default function SubscribeContent() {
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'no-token'>('loading');

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const t = searchParams.get('token');
        void Promise.resolve().then(() => {
            setToken(t);
            if (!t) {
                setStatus('no-token');
            }
        });

        if (!t) {
            return;
        }

        const origin = window.location.origin;
        fetch(`${origin}/internal-events-${t}.ics`, { method: 'HEAD' })
            .then((res) => {
                setStatus(res.ok ? 'valid' : 'invalid');
            })
            .catch(() => {
                setStatus('invalid');
            });
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
                <div className="border-primary-200 border-t-primary-600 mb-4 h-12 w-12 animate-spin rounded-full border-4"></div>
                <p className="text-lg text-gray-800 dark:text-gray-200">
                    Kalender wird verifiziert...
                </p>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
                <h1 className="mb-4 text-2xl font-bold text-red-500">Ungültiger Kalender-Link</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Dieser Kalender-Link ist ungültig oder abgelaufen.
                </p>
            </div>
        );
    }

    if (status === 'no-token') {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
                <h1 className="mb-4 text-2xl font-bold text-red-500">Fehlender Token</h1>
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
        void navigator.clipboard.writeText(icsUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-12">
            <div className="mb-10 text-center">
                <h1 className="font-handwriting text-primary-600 dark:text-primary-400 mb-4 text-3xl font-bold">
                    Interner Kalender
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Abonniere den internen DPSG Wehr Kalender, um alle Termine (z.B. Leiterrunden)
                    automatisch auf deinem Gerät zu haben.
                </p>
            </div>

            <div className="space-y-6">
                {/* Apple / iOS */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center">
                        <IoLogoApple className="mr-3 text-3xl text-gray-900 dark:text-white" />
                        <h2 className="text-xl font-semibold">iPhone, iPad & Mac</h2>
                    </div>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Tippe auf den Button und bestätige das Abonnement.
                    </p>
                    <a
                        href={webcalUrl}
                        className="flex w-full items-center justify-center rounded-lg bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                    >
                        <IoLogoApple className="mr-2 text-xl" />
                        Zu Apple Kalender hinzufügen
                    </a>
                </div>

                {/* Google Calendar */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center">
                        <FcGoogle className="mr-3 text-3xl" />
                        <h2 className="text-xl font-semibold">Google Kalender</h2>
                    </div>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Fügt den Kalender direkt zu deinem Google Konto hinzu (auch für Android).
                    </p>
                    <a
                        href={googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:bg-gray-100 dark:hover:bg-gray-200"
                    >
                        <FcGoogle className="mr-2 text-xl" />
                        Zu Google Kalender hinzufügen
                    </a>
                </div>

                {/* Manual / Outlook */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-4 flex items-center">
                        <PiMicrosoftOutlookLogoFill className="mr-3 text-3xl text-[#0078D4]" />
                        <h2 className="text-xl font-semibold">Outlook / Andere</h2>
                    </div>
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Nutze den Link für eine automatische Aktualisierung oder lade die Datei
                        manuell herunter.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={icsUrl}
                                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`flex w-12 items-center justify-center rounded-lg font-medium text-white transition-all duration-300 active:scale-90 ${
                                    copied
                                        ? 'bg-green-600 ring-2 ring-green-200 dark:ring-green-900'
                                        : 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600'
                                }`}
                            >
                                <div className="relative flex h-5 w-5 items-center justify-center">
                                    <IoCheckmark
                                        size={20}
                                        className={`absolute transform transition-all duration-300 ${
                                            copied ? 'scale-110 opacity-100' : 'scale-0 opacity-0'
                                        }`}
                                    />
                                    <IoCopy
                                        size={20}
                                        className={`absolute transform transition-all duration-300 ${
                                            copied ? 'scale-0 opacity-0' : 'scale-110 opacity-100'
                                        }`}
                                    />
                                </div>
                            </button>
                        </div>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-tight text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                            <strong>Hinweis:</strong> Nur durch das Abonnieren per Link erhältst du
                            automatisch zukünftige Updates.
                        </div>

                        <div className="relative flex items-center py-1">
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                            <span className="mx-4 flex-shrink text-xs tracking-wider text-gray-400 uppercase">
                                Alternative
                            </span>
                            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                        </div>

                        <a
                            href={icsUrl}
                            download="DPSG-Wehr-Kalender.ics"
                            className="flex items-center justify-center self-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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
