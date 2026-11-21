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
                className={`flex items-center gap-3 rounded-xl border border-transparent bg-[#261f74] p-3.5 text-white shadow-xs transition-colors duration-150 hover:bg-[#32298e] active:bg-[#1d175b] dark:border-white/10 ${className || ''}`}
            >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xl text-white">
                    <IoLogInOutline />
                </div>
                <div>
                    <div className="text-base leading-tight font-semibold">Mitgliederportal</div>
                    <div className="mt-0.5 text-xs leading-tight text-slate-300">
                        Daten selbst verwalten (Campflow)
                    </div>
                </div>
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
            className={`cursor-pointer ${defaultDisplay} shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-[#261f74] px-3 py-1.5 text-sm font-medium text-white shadow-xs transition-colors duration-150 hover:bg-[#32298e] focus:ring-2 focus:ring-[#261f74] focus:ring-offset-2 focus:outline-hidden active:bg-[#1d175b] dark:border-white/20 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-700 ${className || ''}`}
        >
            <IoLogInOutline className="shrink-0 text-lg text-white" />
            <span>Login</span>
        </a>
    );
}
