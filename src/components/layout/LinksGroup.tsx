import { useState } from 'react';
import { IoChevronDown } from 'react-icons/io5';

import { getIconFromName } from '@/lib/icons';
import { getFlattenedSidebarLinks } from '@/lib/navigation';
import { NavigationLinkGroup } from '@/types';

export function LinksGroup({
    navigationLinks,
    toggleSidebar,
}: {
    navigationLinks: NavigationLinkGroup;
    toggleSidebar: () => void;
}) {
    const { label, Icon, link, links } = navigationLinks;
    const hasLinks = Array.isArray(links);
    const [opened, setOpened] = useState(false);
    const items = (hasLinks ? links : []).map((item) => {
        const isThemed = !item.color;
        return (
            <a
                className="ml-4 flex flex-row items-center border-l border-solid border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-600"
                href={item.link}
                key={item.label}
                onClick={toggleSidebar}
            >
                <div
                    className={`${isThemed ? 'flex h-[30px] w-[30px] items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' : 'h-4 w-4'} mr-2`}
                >
                    {getIconFromName(item.Icon, item.color)}
                </div>
                {item.label}
            </a>
        );
    });

    const hasIcon = Icon !== undefined;

    const onGroupClick = () => {
        if (hasLinks) {
            setOpened((o) => !o);
        } else {
            toggleSidebar();
        }
    };

    const innerContent = (
        <div className="mb-2 block w-full rounded p-2 font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
            <div className="flex flex-row items-center justify-between gap-0">
                <div className="flex items-center">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                        {hasIcon && getIconFromName(Icon)}
                    </div>
                    <div className="ml-4 text-lg">{label}</div>
                </div>
                {hasLinks && (
                    <div
                        className={`text-gray-600 transition-transform duration-200 dark:text-white ${opened ? '' : '-rotate-90 transform'}`}
                    >
                        <IoChevronDown />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {hasLinks ? (
                <button
                    type="button"
                    onClick={onGroupClick}
                    className="w-full cursor-pointer border-none bg-transparent p-0 text-left"
                    aria-expanded={opened}
                >
                    {innerContent}
                </button>
            ) : (
                <a href={link} onClick={onGroupClick}>
                    {innerContent}
                </a>
            )}
            {hasLinks ? (
                <div
                    className={`grid transition-all duration-200 ease-in-out ${opened ? 'mb-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                    <div className="overflow-hidden">{items}</div>
                </div>
            ) : null}
        </>
    );
}

export function NavbarLinksGroup({
    toggleSidebar,
    links,
}: {
    toggleSidebar: () => void;
    links?: NavigationLinkGroup[];
}) {
    const flattenedLinks = getFlattenedSidebarLinks(links);

    const groups = flattenedLinks.map((group) => {
        return (
            <div key={group.label}>
                <LinksGroup navigationLinks={group} toggleSidebar={toggleSidebar} />
            </div>
        );
    });

    return <div className="m-4">{groups}</div>;
}
