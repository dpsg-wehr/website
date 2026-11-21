import { IoLogoInstagram, IoLogoFacebook } from 'react-icons/io5';

import globalData from '@/content/global/index.json';

import FooterCamp from './FooterCamp';

/** Baked in at build time so the footer render stays pure. */
const CURRENT_YEAR = new Date().getFullYear();

function SocialLink({
    url,
    hoverColor,
    label,
    children,
}: {
    url: string;
    hoverColor: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-gray-600 text-white ${hoverColor} ml-4 transition-colors`}
        >
            {children}
        </a>
    );
}

function FacebookLink({ url }: { url: string }) {
    return (
        <SocialLink url={url} hoverColor="hover:text-blue-600" label="Facebook">
            <IoLogoFacebook />
        </SocialLink>
    );
}

function InstagramLink({ url }: { url: string }) {
    return (
        <SocialLink url={url} hoverColor="hover:text-pink-600" label="Instagram">
            <IoLogoInstagram />
        </SocialLink>
    );
}

function SocialMedia({ facebook, instagram }: { facebook: string; instagram: string }) {
    return (
        <div className="mt-10 mb-0 flex w-full place-content-between content-center">
            <p className="ml-4 text-center text-sm text-white">
                © {CURRENT_YEAR} DPSG St. Bernhard Wehr
                <span className="mx-2 text-gray-400">•</span>
                <a href="/intern" className="text-green-50 underline hover:text-white">
                    Intern
                </a>
            </p>
            <div className="mr-4 flex place-content-end items-center">
                {instagram && <InstagramLink url={instagram} />}
                {facebook && <FacebookLink url={facebook} />}
            </div>
        </div>
    );
}

function FooterLink({
    url,
    text,
    external = true,
}: {
    url: string;
    text: string;
    external?: boolean;
}) {
    if (!url || !text) return null;
    return (
        <a
            href={url}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="mb-1 text-sm text-green-50 hover:underline"
        >
            {text}
        </a>
    );
}

function FooterLinkColumn({
    title,
    links,
}: {
    title: string;
    links: { text: string; url: string; external: boolean }[];
}) {
    return (
        <div className="m-4 mb-0 flex w-auto flex-col sm:flex-1">
            <h1 className="mb-2 text-lg font-semibold">{title}</h1>
            {links.map((link, i) => (
                <FooterLink key={i} {...link} />
            ))}
        </div>
    );
}

function FooterDPSG() {
    return (
        <div className="m-4 mb-0 md:flex-shrink-0">
            <h1 className="mb-2 text-lg font-semibold">DPSG</h1>
            <a href="https://www.dpsg.de" target="_blank" rel="noopener noreferrer">
                <img
                    src="/dpsg.svg"
                    alt="DPSG Logo"
                    width="224"
                    height="108"
                    className="w-full bg-white sm:w-56"
                    loading="lazy"
                    data-image-component="true"
                />
            </a>
        </div>
    );
}

function FooterMain({
    columns,
}: {
    columns: { title: string; links: { text: string; url: string; external: boolean }[] }[];
}) {
    return (
        <div className="flex flex-col flex-wrap gap-4 text-white sm:flex-row">
            <div className="flex flex-1 flex-row place-content-between">
                {columns.map((col, i) => (
                    <FooterLinkColumn key={i} title={col.title} links={col.links} />
                ))}
            </div>
            <FooterDPSG />
        </div>
    );
}

export default function Footer() {
    let social = {
        facebook: 'https://de-de.facebook.com/dpsgwehr/',
        instagram: 'https://www.instagram.com/pfadfinder_wehr/',
    };
    let columns: {
        title: string;
        links: { text: string; url: string; external: boolean }[];
    }[] = [
        {
            title: 'Hütten',
            links: [
                {
                    text: 'St. Raphael in Todtmoos',
                    url: 'https://www.pfadfinderheim-st-raphael.de/',
                    external: true,
                },
                {
                    text: 'Pfadfinderhaus Nöggenschwiel',
                    url: 'http://www.pfadfinderhaus-noeggenschwiel.de/',
                    external: true,
                },
            ],
        },
        {
            title: 'Sonstiges',
            links: [
                { text: 'Impressum', url: '/pages/impressum', external: false },
                { text: 'Datenschutz', url: '/pages/datenschutz', external: false },
                {
                    text: 'Quellcode',
                    url: 'https://github.com/dpsg-wehr/website',
                    external: true,
                },
            ],
        },
    ];

    const footerData = globalData?.footer;
    if (footerData) {
        if (footerData.social) {
            social = {
                facebook: footerData.social.facebook || social.facebook,
                instagram: footerData.social.instagram || social.instagram,
            };
        }
        if (footerData.columns) {
            columns = footerData.columns.map((col) => ({
                title: col?.title || '',
                links:
                    col?.links?.map((l) => ({
                        text: l?.text || '',
                        url: l?.url || '',
                        external: l?.external ?? false,
                    })) || [],
            }));
        }
    }

    return (
        <footer data-nosnippet className="w-full">
            <FooterCamp />
            <div className="bg-gray-800 pt-6 pb-2">
                <div className="mx-auto my-0 flex max-w-sm flex-col justify-center px-3 sm:max-w-4xl">
                    <FooterMain columns={columns} />
                    <SocialMedia facebook={social.facebook} instagram={social.instagram} />
                </div>
            </div>
        </footer>
    );
}
