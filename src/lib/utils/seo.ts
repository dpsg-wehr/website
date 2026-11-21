import type { BreadcrumbItem } from '@/types';

export const DEFAULT_SITE_URL = 'https://dpsg-wehr.de';

/**
 * Normalizes the site URL from Astro.site or string, trimming trailing slashes.
 */
export function getSiteUrl(site?: URL | string | null): string {
    if (!site) return DEFAULT_SITE_URL;
    return site.toString().replace(/\/$/, '');
}

/**
 * Generates an absolute canonical URL for a given path.
 */
export function getCanonicalUrl(pathname: string, site?: URL | string | null): string {
    const siteUrl = getSiteUrl(site);
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return new URL(normalizedPath, siteUrl).href;
}

/**
 * Creates a Schema.org BreadcrumbList structured data object.
 */
export function createBreadcrumbSchema(items: BreadcrumbItem[], site?: URL | string | null) {
    const siteUrl = getSiteUrl(site);

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => {
            const itemUrl = item.url
                ? item.url
                : item.path
                  ? item.path.startsWith('http')
                      ? item.path
                      : `${siteUrl}${item.path.startsWith('/') ? item.path : `/${item.path}`}`
                  : `${siteUrl}/`;

            return {
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: itemUrl,
            };
        }),
    };
}

/**
 * Standard Organization / NGO Schema for DPSG Wehr.
 */
export function createOrganizationSchema(site?: URL | string | null) {
    const siteUrl = getSiteUrl(site);

    return {
        '@context': 'https://schema.org',
        '@type': 'NGO',
        additionalType: 'https://www.wikidata.org/wiki/Q2301851',
        name: 'DPSG Stamm St. Bernhard Wehr',
        alternateName: ['Pfadfinder Wehr', 'DPSG Wehr', 'DPSG Stamm Wehr'],
        url: siteUrl,
        logo: `${siteUrl}/media/images/logo.png`,
        sameAs: [
            'https://de-de.facebook.com/dpsgwehr/',
            'https://www.instagram.com/pfadfinder_wehr/',
            'https://github.com/dpsg-wehr/website',
        ],
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Kirchplatz 1',
            addressLocality: 'Wehr',
            postalCode: '79664',
            addressCountry: 'DE',
        },
        parentOrganization: {
            '@type': 'NGO',
            name: 'Deutsche Pfadfinder*innenschaft Sankt Georg (DPSG)',
            url: 'https://dpsg.de',
            sameAs: 'https://www.wikidata.org/wiki/Q1203670',
        },
    };
}

export interface BlogPostingOptions {
    headline: string;
    description: string;
    canonicalUrl: string;
    imageUrl: string;
    datePublished: string;
    author?: string;
    site?: URL | string | null;
}

/**
 * Schema.org BlogPosting structured data generator.
 */
export function createBlogPostingSchema(options: BlogPostingOptions) {
    const siteUrl = getSiteUrl(options.site);
    const absoluteImageUrl = options.imageUrl.startsWith('http')
        ? options.imageUrl
        : `${siteUrl}${options.imageUrl.startsWith('/') ? options.imageUrl : `/${options.imageUrl}`}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': options.canonicalUrl,
        },
        headline: options.headline,
        description: options.description,
        image: [absoluteImageUrl],
        datePublished: options.datePublished,
        author: {
            '@type': 'Person',
            name: options.author || 'DPSG Stamm St. Bernhard Wehr',
        },
        publisher: {
            '@type': 'NGO',
            name: 'DPSG Stamm St. Bernhard Wehr',
            url: siteUrl,
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/media/images/logo.png`,
            },
        },
    };
}

export interface EventSchemaData {
    name?: string;
    startDate?: string;
    endDate?: string;
    eventAttendanceMode?: string;
    eventStatus?: string;
    isAccessibleForFree?: boolean;
    location?: {
        name?: string;
        description?: string;
        hasMap?: string;
        geo?: {
            latitude?: number;
            longitude?: number;
        };
        address?: {
            streetAddress?: string;
            addressLocality?: string;
            postalCode?: string;
            addressCountry?: string;
        };
    };
}

/**
 * Schema.org Event structured data generator.
 */
export function createEventSchema(
    eventData: EventSchemaData | undefined,
    options: {
        fallbackTitle: string;
        description: string;
        image?: string;
        site?: URL | string | null;
    }
) {
    if (!eventData) return null;

    const siteUrl = getSiteUrl(options.site);
    const eventImage = options.image
        ? [`${siteUrl}${options.image.startsWith('/') ? options.image : `/${options.image}`}`]
        : [`${siteUrl}/media/images/logo.png`];

    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: eventData.name || options.fallbackTitle,
        description: options.description,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        eventAttendanceMode:
            eventData.eventAttendanceMode || 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: eventData.eventStatus || 'https://schema.org/EventScheduled',
        location: eventData.location
            ? {
                  '@type': 'Place',
                  name: eventData.location.name,
                  description: eventData.location.description,
                  hasMap: eventData.location.hasMap,
                  geo: eventData.location.geo
                      ? {
                            '@type': 'GeoCoordinates',
                            latitude: eventData.location.geo.latitude,
                            longitude: eventData.location.geo.longitude,
                        }
                      : undefined,
                  address: eventData.location.address
                      ? {
                            '@type': 'PostalAddress',
                            ...eventData.location.address,
                        }
                      : undefined,
              }
            : undefined,
        image: eventImage,
        isAccessibleForFree: eventData.isAccessibleForFree ?? true,
        organizer: {
            '@type': 'NGO',
            name: 'DPSG Stamm St. Bernhard Wehr',
            url: siteUrl,
        },
    };
}
