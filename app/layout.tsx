import type { Metadata, Viewport } from 'next';
import './globals.css';
import LayoutBody from '@/components/layout/LayoutBody';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/providers/Providers';
import Banner from '@/components/layout/Banner';
import { getActiveBanner } from '@/lib/content/banner';

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
        { media: '(prefers-color-scheme: dark)', color: '#374151' },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL('https://dpsg-wehr.de'),
    title: 'DPSG Wehr',
    description: 'Website der DPSG Wehr',
    other: {
        'darkreader-lock': 'true',
    },
    openGraph: {
        title: 'DPSG Wehr',
        description: 'Website der DPSG Wehr',
        url: '/',
        siteName: 'DPSG Wehr',
        images: [
            {
                url: '/media/images/logo.png',
                width: 800,
                height: 800,
            },
        ],
        locale: 'de_DE',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'DPSG Wehr',
        description: 'Website der DPSG Wehr',
        images: ['/media/images/logo.png'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const banner = getActiveBanner();

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NGO',
        name: 'DPSG Stamm St. Bernhard Wehr',
        alternateName: ['Pfadfinder Wehr', 'DPSG Wehr', 'DPSG Stamm Wehr'],
        url: 'https://dpsg-wehr.de',
        logo: 'https://dpsg-wehr.de/media/images/logo.png',
        sameAs: [
            'https://de-de.facebook.com/dpsgwehr/',
            'https://www.instagram.com/pfadfinder_wehr/',
            'https://github.com/Linus-f/website-dpsg-wehr',
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
            name: 'Deutsche Pfadfinderschaft Sankt Georg (DPSG)',
            url: 'https://dpsg.de',
        },
    };

    return (
        <html lang="de" suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
                />
            </head>
            <body className={`antialiased prose-headings:break-words prose-headings:hyphens-auto`}>
                <Providers>
                    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-700">
                        <Navbar />
                        <Banner banner={banner} />
                        <LayoutBody>{children}</LayoutBody>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
