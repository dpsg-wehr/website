import { NavigationLinkGroup } from '@/types';

// Temporarily disabled until the Mitgliederportal launches next year.
export const ENABLE_MITGLIEDERPORTAL = false;

export const navigationLinks: Array<NavigationLinkGroup> = [
    { label: 'News', link: '/news', Icon: 'News' },
    {
        label: 'Gruppen',
        link: '',
        Icon: 'People',
        links: [
            {
                label: 'Wölflinge',
                link: '/pages/gruppen/woelflinge',
                Icon: 'Lilie',
                color: '#ec661a',
            },
            {
                label: 'Jungpfadfinder',
                link: '/pages/gruppen/jungpfadfinder',
                Icon: 'Lilie',
                color: '#2d54a1',
            },
            {
                label: 'Pfadfinder',
                link: '/pages/gruppen/pfadfinder',
                Icon: 'Lilie',
                color: '#08833c',
            },
            { label: 'Rover', link: '/pages/gruppen/rover', Icon: 'Lilie', color: '#cc1e2f' },
            {
                label: 'Leiterrunde',
                link: '/pages/gruppen/leiter',
                Icon: 'Lilie',
                color: '#FFC107',
            },
        ],
    },
    { label: 'Fotos', link: '/gallerie', Icon: 'Image' },
    { label: 'Anmeldung', link: '/pages/anmeldung', Icon: 'File' },
    {
        label: 'Mehr',
        link: '',
        Icon: 'More',
        links: [
            {
                label: 'Pfadfinderheim St. Raphael',
                link: 'https://www.pfadfinderheim-st-raphael.de/',
                Icon: 'House',
            },
            {
                label: 'Pfadfinderhaus Nöggenschwiel',
                link: 'http://www.pfadfinderhaus-noeggenschwiel.de/',
                Icon: 'House',
            },
            { label: 'Kontakt', link: '/pages/kontakt', Icon: 'Mail' },
        ],
    },
];
