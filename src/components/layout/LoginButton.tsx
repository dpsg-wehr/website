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
                className={`flex items-center justify-between p-3.5 rounded-xl bg-[#261f74] hover:bg-[#32298e] active:bg-[#1d175b] text-white shadow-xs transition-colors duration-150 ${className || ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#00c89f]/20 flex items-center justify-center text-xl text-[#00c89f] shrink-0">
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
                <span className="text-xs bg-[#00c89f] text-slate-950 font-semibold px-2.5 py-1 rounded-md">
                    Login ↗
                </span>
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
            className={`cursor-pointer ${defaultDisplay} items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#00c89f] hover:bg-[#00b38e] active:bg-[#009e7d] text-slate-950 transition-colors duration-150 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#00c89f] focus:ring-offset-2 dark:focus:ring-offset-gray-700 shrink-0 ${className || ''}`}
        >
            <IoLogInOutline className="text-lg shrink-0 text-slate-950" />
            <span>Login</span>
        </a>
    );
}
