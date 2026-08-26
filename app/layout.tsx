import type { Metadata, Viewport } from 'next';
import './globals.css';
import LayoutBody from '@/components/LayoutBody';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import SVGSymbols from '@/components/SVGSymbols';
import Banner from '@/components/Banner';
import { getActiveBanner } from '@/lib/banner';

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

    return (
        <html lang="de" suppressHydrationWarning>
            <head></head>
            <body className={`antialiased prose-headings:break-words prose-headings:hyphens-auto`}>
                <SVGSymbols />
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
