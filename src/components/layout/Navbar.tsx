import { useState, useEffect } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import SearchButton from '@/components/search/SearchButton';
import ToggleThemeButton from '@/components/ui/ToggleThemeButton';
import { ENABLE_MITGLIEDERPORTAL } from '@/lib/config';
import { getIconFromName } from '@/lib/icons';
import { getNavigationLinks } from '@/lib/navigation';
import type { NavigationLinkGroup, NavigationLink } from '@/types';

import LoginButton from './LoginButton';
import Sidebar from './Sidebar';

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
                        className="flex flex-row items-center rounded px-2 py-2 leading-none font-light whitespace-nowrap hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600"
                    >
                        <div
                            className={`${isThemed ? 'h-[30px] w-[30px] rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'h-5 w-5'} mr-2 flex items-center justify-center`}
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
                <div key={link.label} className="group relative">
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
                    <div className="absolute left-0 z-50 hidden w-auto min-w-[200px] pt-2 group-focus-within:block group-hover:block">
                        <div className="flex flex-col gap-1 rounded border border-gray-100 bg-white p-1 shadow-lg dark:border-gray-600 dark:bg-gray-700">
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
                className="block rounded px-1.5 py-2 leading-none font-light hover:bg-gray-200 md:px-2 lg:px-3 dark:hover:bg-gray-600"
            >
                {link.label}
            </a>
        );
    });

    return (
        <>
            <header
                data-nosnippet
                className="sticky top-0 z-50 h-[72px] bg-gray-50 px-4 shadow-md sm:px-6 lg:px-8 dark:bg-gray-700"
            >
                <div className="flex h-full w-full items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button
                            onClick={() => setIsOpen((prev) => !prev)}
                            className="group z-50 flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1 rounded text-gray-700 transition-colors duration-200 hover:bg-gray-200 min-[960px]:hidden dark:text-gray-200 dark:hover:bg-gray-600"
                            aria-label="Toggle navigation"
                        >
                            <span
                                className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out${
                                    isOpen ? ' translate-y-1.5 rotate-45' : ''
                                }`}
                            />
                            <span
                                className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out${
                                    isOpen ? ' opacity-0' : ''
                                }`}
                            />
                            <span
                                className={`block h-0.5 w-5 bg-current transition-all duration-300 ease-in-out${
                                    isOpen ? ' -translate-y-1.5 -rotate-45' : ''
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
                                <h1 className="ml-2 hidden overflow-auto text-lg font-bold min-[400px]:block">
                                    Pfadfinder Wehr
                                </h1>
                            </div>
                        </a>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
                        <div className="mr-1 hidden flex-row items-center gap-0.5 min-[960px]:flex md:mr-2 md:gap-1 lg:gap-2">
                            {renderedItems}
                        </div>
                        <SearchButton />
                        <ToggleThemeButton />
                        {ENABLE_MITGLIEDERPORTAL && (
                            <LoginButton className="hidden sm:inline-flex" />
                        )}
                    </div>
                </div>
            </header>
            <Sidebar isOpen={isOpen} toggle={() => setIsOpen(false)} links={navLinks} />
        </>
    );
}
