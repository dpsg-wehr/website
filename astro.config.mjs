import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    site: 'https://dpsg-wehr.de',
    output: 'static',
    outDir: 'out',
    cacheDir: './.astro/cache',
    trailingSlash: 'ignore',
    server: {
        port: 3000,
    },
    integrations: [
        react(),
        mdx(),
        sitemap({
            filter: (page) => !page.includes('/admin/'),
        }),
    ],
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp',
            config: {
                webp: {
                    effort: 6,
                    quality: 80,
                },
                avif: {
                    effort: 6,
                    quality: 75,
                },
            },
        },
    },
    vite: {
        plugins: [tailwindcss()],
        optimizeDeps: {
            include: [
                'fuse.js',
                'react-icons/io5',
                'react-icons/hi',
                'react-icons/io',
                'react-photo-album',
                'react-select',
                'yet-another-react-lightbox',
                'yet-another-react-lightbox/plugins/captions',
                'yet-another-react-lightbox/plugins/fullscreen',
                'yet-another-react-lightbox/plugins/zoom',
                '@fullcalendar/react',
                '@fullcalendar/react/daygrid',
                '@fullcalendar/react/timegrid',
                '@fullcalendar/react/list',
                '@fullcalendar/react/themes/classic',
            ],
        },
    },
    build: {
        inlineStylesheets: 'always',
    },
});
