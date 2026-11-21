import globalData from '@/content/global/index.json';
import { navigationLinks as defaultNavLinks } from '@/lib/config';
import type { Icons } from '@/lib/icons';
import type { NavigationLinkGroup, NavigationLink } from '@/types';

interface RawNavItem {
    label: string;
    link?: string;
    icon?: string;
    links?: Array<{
        label: string;
        link: string;
        icon?: string;
        color?: string;
    }>;
}

/**
 * Returns the effective navigation links, respecting CMS global configuration if present.
 */
export function getNavigationLinks(): NavigationLinkGroup[] {
    const rawNav = (globalData as { header?: { nav?: RawNavItem[] } })?.header?.nav;

    if (rawNav && Array.isArray(rawNav) && rawNav.length > 0) {
        return rawNav.map((item) => ({
            label: item.label,
            link: item.link || '',
            Icon: (item.icon as Icons) || undefined,
            links: item.links?.map((subItem) => ({
                label: subItem.label,
                link: subItem.link,
                Icon: (subItem.icon as Icons) || 'None',
                color: subItem.color,
            })),
        }));
    }

    return defaultNavLinks;
}

/**
 * Transforms navigation links for the mobile sidebar.
 * Specifically unnests utility sublinks like "Mehr" so users can tap them directly.
 */
export function getFlattenedSidebarLinks(
    links: NavigationLinkGroup[] = getNavigationLinks()
): NavigationLinkGroup[] {
    const flattened: NavigationLinkGroup[] = [];

    links.forEach((group) => {
        if (group.label === 'Mehr' && group.links) {
            group.links.forEach((subLink: NavigationLink) => {
                flattened.push({
                    label: subLink.label,
                    link: subLink.link,
                    Icon: subLink.Icon,
                });
            });
        } else {
            flattened.push(group);
        }
    });

    return flattened;
}

/**
 * Looks up an icon name for a given route/slug from the navigation tree.
 */
export function findNavigationIcon(
    slug: string,
    links: NavigationLinkGroup[] = getNavigationLinks()
): Icons | undefined {
    for (const group of links) {
        if (group.link === slug && group.Icon) {
            return group.Icon;
        }
        if (group.links) {
            for (const subLink of group.links) {
                if (subLink.link === slug) {
                    return subLink.Icon;
                }
            }
        }
    }
    return undefined;
}
