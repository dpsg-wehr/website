'use client';

import { NavbarLinksGroup } from './LinksGroup';
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
            <div onClick={(e) => e.stopPropagation()} className="h-full overflow-y-auto">
                <NavbarLinksGroup toggleSidebar={toggle} links={links} />
            </div>
        </div>
    );
}
