import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import getPostMetadata from '@/lib/content/posts';

export const dynamic = 'force-static';

const BASE_URL = 'https://dpsg-wehr.de';

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: `${BASE_URL}/`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/gallerie`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    // 1. Add Posts
    const posts = getPostMetadata();
    for (const post of posts) {
        sitemapEntries.push({
            url: `${BASE_URL}/posts/${post.slug}`,
            lastModified: post.date ? new Date(post.date) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        });
    }

    // 2. Add Groups (content/gruppen)
    const gruppenDir = path.join(process.cwd(), 'content', 'gruppen');
    if (fs.existsSync(gruppenDir)) {
        const groupFiles = fs.readdirSync(gruppenDir).filter((file) => file.endsWith('.mdx'));
        for (const file of groupFiles) {
            const slug = file.replace('.mdx', '');
            const filePath = path.join(gruppenDir, file);
            const stats = fs.statSync(filePath);
            sitemapEntries.push({
                url: `${BASE_URL}/pages/gruppen/${slug}`,
                lastModified: stats.mtime,
                changeFrequency: 'monthly',
                priority: 0.8,
            });
        }
    }

    // 3. Add Generic Pages (content/pages)
    const pagesDir = path.join(process.cwd(), 'content', 'pages');
    if (fs.existsSync(pagesDir)) {
        const pageFiles = fs.readdirSync(pagesDir).filter((file) => file.endsWith('.mdx'));
        const excludePages = ['startseite.mdx', 'gallerie.mdx'];
        for (const file of pageFiles) {
            if (excludePages.includes(file)) continue;
            const slug = file.replace('.mdx', '');
            const filePath = path.join(pagesDir, file);
            const stats = fs.statSync(filePath);
            sitemapEntries.push({
                url: `${BASE_URL}/pages/${slug}`,
                lastModified: stats.mtime,
                changeFrequency: 'monthly',
                priority: 0.6,
            });
        }
    }

    return sitemapEntries;
}
