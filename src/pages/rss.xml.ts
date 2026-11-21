import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

import getPostMetadata from '@/lib/content/posts';
import { renderRssContent } from '@/lib/content/rss';

export async function GET(context: APIContext) {
    const siteUrl =
        import.meta.env.DEV && context.url?.origin
            ? context.url.origin
            : (context.site?.toString() ?? 'https://dpsg-wehr.de');
    const posts = getPostMetadata();

    return rss({
        title: 'DPSG Stamm Wehr - Aktuelles',
        description:
            'Neuigkeiten und Berichte von unseren Aktionen, Zeltlagern und Gruppenstunden.',
        site: siteUrl,
        stylesheet: '/rss-style.xsl',
        items: posts.map((post) => ({
            title: post.title,
            pubDate: new Date(post.date),
            description: post.desc || post.subtitle || '',
            link: `/posts/${post.slug}/`,
            author: post.author,
            content: renderRssContent(post, siteUrl),
        })),
        customData: `<language>de</language>`,
    });
}
