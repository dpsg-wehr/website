import fs from 'node:fs';
import path from 'node:path';

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
    site: 'https://dpsg-wehr.de',
    output: 'static',
    outDir: 'out',
    cacheDir: './.astro/cache',
    trailingSlash: 'ignore',
    server: {
        port: 3000,
    },
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'hover',
    },
    integrations: [
        react(),
        mdx(),
        sitemap({
            filter: (page) =>
                !page.includes('/admin/') &&
                !page.includes('/404') &&
                !page.includes('/intern') &&
                !page.includes('/subscribe'),
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
        plugins: [
            tailwindcss(),
            {
                name: 'admin-dev-rewrite',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.url === '/admin' || req.url === '/admin/') {
                            req.url = '/admin/index.html';
                            return next();
                        }
                        if (
                            req.url &&
                            (req.url.startsWith('/media/images/') ||
                                req.url.startsWith('/src/assets/images/'))
                        ) {
                            const fileName = req.url
                                .replace(/^\/(?:media|src\/assets)\/images\//, '')
                                .split('?')[0];
                            const filePath = path.resolve('src/assets/images', fileName);
                            if (fs.existsSync(filePath)) {
                                const ext = path.extname(filePath).toLowerCase();
                                const mime =
                                    ext === '.png'
                                        ? 'image/png'
                                        : ext === '.svg'
                                          ? 'image/svg+xml'
                                          : ext === '.webp'
                                            ? 'image/webp'
                                            : 'image/jpeg';
                                res.setHeader('Content-Type', mime);
                                return fs.createReadStream(filePath).pipe(res);
                            }
                        }
                        next();
                    });
                },
            },
        ],
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
