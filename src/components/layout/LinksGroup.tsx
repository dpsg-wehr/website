import { useState } from 'react';
import { navigationLinks } from '@/lib/config';
import { NavigationLinkGroup } from '@/types';
import { getIconFromName } from '@/lib/icons';
import { IoChevronDown } from 'react-icons/io5';

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
    const items = (hasLinks ? links : []).map((link) => {
        const isThemed = !link.color;
        return (
            <a
                className="font-medium flex flex-row items-center px-4 py-3 ml-4 border-l border-solid border-gray-200 dark:border-gray-500 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                href={link.link}
                key={link.label}
                onClick={toggleSidebar}
            >
                <div
                    className={`${isThemed ? 'w-[30px] h-[30px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center' : 'w-4 h-4'} mr-2`}
                >
                    {getIconFromName(link.Icon, link.color)}
                </div>
                {link.label}
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
        <div className="font-medium block w-full hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded mb-2">
            <div className="flex flex-row justify-between gap-0 items-center">
                <div className="flex items-center">
                    <div className="flex items-center justify-center w-[30px] h-[30px] rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                        {hasIcon && getIconFromName(Icon)}
                    </div>
                    <div className="ml-4 text-lg">{label}</div>
                </div>
                {hasLinks && (
                    <div
                        className={`text-gray-600 dark:text-white transition-transform duration-200 ${opened ? '' : 'transform -rotate-90'}`}
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
                    className="w-full text-left bg-transparent border-none p-0 cursor-pointer"
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
                    className={`grid transition-all duration-200 ease-in-out ${opened ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0'}`}
                >
                    <div className="overflow-hidden">{items}</div>
                </div>
            ) : null}
        </>
    );
}

export function NavbarLinksGroup({ toggleSidebar }: { toggleSidebar: () => void }) {
    const flattenedLinks: NavigationLinkGroup[] = [];

    navigationLinks.forEach((group) => {
        if (group.label === 'Mehr' && group.links) {
            group.links.forEach((link) => {
                flattenedLinks.push({
                    label: link.label,
                    link: link.link,
                    Icon: link.Icon,
                });
            });
        } else {
            flattenedLinks.push(group);
        }
    });

    const groups = flattenedLinks.map((group) => {
        return (
            <div key={group.label}>
                <LinksGroup navigationLinks={group} toggleSidebar={toggleSidebar} />
            </div>
        );
    });

    return <div className="m-4">{groups}</div>;
}
