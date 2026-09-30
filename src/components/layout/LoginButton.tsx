import { IoLogInOutline } from 'react-icons/io5';

interface LoginButtonProps {
    className?: string;
    variant?: 'navbar' | 'sidebar';
    onClick?: () => void;
}

export const PORTAL_URL = 'https://on.campflow.de/dpsg-wehr/portal';

export default function LoginButton({ className, variant = 'navbar', onClick }: LoginButtonProps) {
    if (variant === 'sidebar') {
        return (
            <a
                href={PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
                aria-label="Campflow Mitgliederportal Login"
                className={`group flex items-center justify-between p-3.5 rounded-xl bg-[#261f74] hover:bg-[#32298e] active:bg-[#1d175b] text-white border border-transparent dark:border-white/10 shadow-xs transition-colors duration-150 ${className || ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-xl text-white shrink-0">
                        <IoLogInOutline />
                    </div>
                    <div>
                        <div className="font-semibold text-base leading-tight">
                            Mitgliederportal
                        </div>
                        <div className="text-xs text-slate-300 leading-tight mt-0.5">
                            Daten selbst verwalten (Campflow)
                        </div>
                    </div>
                </div>
                <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors shrink-0 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
            </a>
        );
    }

    const defaultDisplay =
        className?.includes('hidden') ||
        className?.includes('flex') ||
        className?.includes('inline')
            ? ''
            : 'inline-flex';

    return (
        <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Campflow Mitgliederportal Login"
            title="Campflow Mitgliederportal"
            onClick={onClick}
            className={`cursor-pointer ${defaultDisplay} items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#261f74] hover:bg-[#32298e] active:bg-[#1d175b] text-white border border-transparent dark:border-white/20 transition-colors duration-150 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#261f74] dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-700 shrink-0 ${className || ''}`}
        >
            <IoLogInOutline className="text-lg shrink-0 text-white" />
            <span>Login</span>
        </a>
    );
}
