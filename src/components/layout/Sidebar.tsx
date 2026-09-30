'use client';

import { NavbarLinksGroup } from './LinksGroup';
import LoginButton from './LoginButton';
import type { NavigationLinkGroup } from '@/types';

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
            className={`z-40 fixed top-0 left-0 w-full h-full pt-[72px] bg-gray-100 dark:bg-gray-700 transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onClick={toggle}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="h-full flex flex-col justify-between overflow-y-auto"
            >
                <div className="pt-2">
                    <NavbarLinksGroup toggleSidebar={toggle} links={links} />
                </div>
                <div className="mx-4 mb-8 pt-4 border-t border-gray-200 dark:border-gray-600/60 shrink-0">
                    <LoginButton variant="sidebar" onClick={toggle} />
                </div>
            </div>
        </div>
    );
}
