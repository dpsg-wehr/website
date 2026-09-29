import { useState, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import ToggleThemeButton from '@/components/ui/ToggleThemeButton';
import { getNavigationLinks } from '@/lib/navigation';
import { getIconFromName } from '@/lib/icons';
import Sidebar from './Sidebar';
import SearchButton from '@/components/search/SearchButton';
import type { NavigationLinkGroup, NavigationLink } from '@/types';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof document !== 'undefined') {
            const sb = document.querySelector('[data-testid="mobile-sidebar"]');
            return sb ? sb.classList.contains('translate-x-0') : false;
        }
        return false;
    });

    useEffect(() => {
        (window as Window & { __NAVBAR_HYDRATED__?: boolean }).__NAVBAR_HYDRATED__ = true;
    }, []);

    const navLinks: NavigationLinkGroup[] = getNavigationLinks();

    const renderedItems = navLinks.map((link: NavigationLinkGroup) => {
        if (link.links) {
            const menuItems = link.links?.map((item: NavigationLink) => {
                const Icon = getIconFromName(item.Icon, item.color);
                const isThemed = !item.color;

                return (
                    <a
                        key={item.link}
                        href={item.link}
                        className="leading-none py-2 px-2 font-light hover:bg-gray-200 dark:hover:bg-gray-600 rounded dark:text-white flex flex-row items-center whitespace-nowrap"
                    >
                        <div
                            className={`${isThemed ? 'w-[30px] h-[30px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 'w-5 h-5'} mr-2 flex items-center justify-center`}
                        >
                            {Icon}
                        </div>
                        {item.label}
                    </a>
                );
            });

            const triggerClassName =
                'leading-none py-2 px-1.5 md:px-2 lg:px-3 font-light hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex flex-row items-center text-inherit bg-transparent border-0 cursor-pointer';

            const triggerContent = (
                <>
                    <span className="mr-1">{link.label}</span>
                    <div className="mt-1 text-gray-600 dark:text-white">
                        <IoChevronDown />
                    </div>
                </>
            );

            return (
                <div key={link.label} className="relative group">
                    {link.link && link.link !== '#' ? (
                        <a href={link.link} className={triggerClassName}>
                            {triggerContent}
                        </a>
                    ) : (
                        <button type="button" aria-haspopup="true" className={triggerClassName}>
                            {triggerContent}
                        </button>
                    )}
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 pt-2 hidden group-hover:block group-focus-within:block w-auto min-w-[200px] z-50">
                        <div className="bg-white dark:bg-gray-700 shadow-lg border border-gray-100 dark:border-gray-600 rounded p-1 flex flex-col gap-1">
                            {menuItems}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <a
                key={link.label}
                href={link.link}
                className="block leading-none py-2 px-1.5 md:px-2 lg:px-3 font-light rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                {link.label}
            </a>
        );
    });

    return (
        <>
            <header
                data-nosnippet
                className="h-[72px] px-4 shadow-md sticky top-0 z-50 dark:bg-gray-700 bg-gray-50"
            >
                <div className="h-full flex justify-between items-center max-w-6xl mx-auto">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setIsOpen((prev) => !prev)}
                            className="min-[840px]:hidden rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 z-50 flex flex-col justify-center items-center w-10 h-10 gap-1 group transition-colors duration-200 cursor-pointer"
                            aria-label="Toggle navigation"
                        >
                            <span
                                className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out${
                                    isOpen ? ' rotate-45 translate-y-1.5' : ''
                                }`}
                            />
                            <span
                                className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out${
                                    isOpen ? ' opacity-0' : ''
                                }`}
                            />
                            <span
                                className={`block w-5 h-0.5 bg-current transition-all duration-300 ease-in-out${
                                    isOpen ? ' -rotate-45 -translate-y-1.5' : ''
                                }`}
                            />
                        </button>
                        <a href="/">
                            <div className="flex flex-row items-center">
                                <picture>
                                    <source
                                        srcSet="/media/images/logo-120.webp 2x, /media/images/logo.webp 1x"
                                        type="image/webp"
                                    />
                                    <img
                                        width={60}
                                        height={60}
                                        src="/media/images/logo.png"
                                        alt="Logo"
                                        loading="eager"
                                        decoding="async"
                                    />
                                </picture>
                                <h1 className="font-bold text-lg ml-2 hidden min-[400px]:block overflow-auto">
                                    Pfadfinder Wehr
                                </h1>
                            </div>
                        </a>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 lg:gap-4">
                        <div className="hidden min-[840px]:flex flex-row gap-0.5 md:gap-1 lg:gap-2 items-center mr-1 md:mr-2 lg:mr-4">
                            {renderedItems}
                        </div>
                        <SearchButton />
                        <ToggleThemeButton />
                    </div>
                </div>
            </header>
            <Sidebar isOpen={isOpen} toggle={() => setIsOpen(false)} links={navLinks} />
        </>
    );
}
