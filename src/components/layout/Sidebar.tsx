'use client';

import { ENABLE_MITGLIEDERPORTAL } from '@/lib/config';
import type { NavigationLinkGroup } from '@/types';

import { NavbarLinksGroup } from './LinksGroup';
import LoginButton from './LoginButton';

export default function Sidebar({
    isOpen,
    toggle,
    links,
}: {
    isOpen: boolean;
    toggle: () => void;
    links?: NavigationLinkGroup[];
}) {
    return (
        <div
            data-testid="mobile-sidebar"
            aria-hidden={!isOpen}
            inert={!isOpen}
            className={`fixed top-0 left-0 z-40 h-full w-full bg-gray-100 pt-[72px] transition-transform duration-300 ease-in-out dark:bg-gray-700 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={toggle}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-full flex-col justify-between overflow-y-auto"
            >
                <div className="pt-2">
                    <NavbarLinksGroup toggleSidebar={toggle} links={links} />
                </div>
                {ENABLE_MITGLIEDERPORTAL && (
                    <div className="mx-4 mb-8 shrink-0 border-t border-gray-200 pt-4 dark:border-gray-600/60">
                        <LoginButton variant="sidebar" onClick={toggle} />
                    </div>
                )}
            </div>
        </div>
    );
}
