import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { resolveImage } from '@/lib/assets/images';
import type { PostMetadata } from '@/types';

const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
});

export function resolveRssImageUrl(src: string, siteUrl: string): string {
    const resolved = resolveImage(src);
    const finalSrc = resolved?.src || src;
    if (finalSrc.startsWith('http://') || finalSrc.startsWith('https://')) {
        return finalSrc;
    }
    return new URL(finalSrc, siteUrl).href;
}

export function renderRssContent(post: PostMetadata, siteUrl: string): string {
    let rawBody = post.body || '';

    // Convert <MDXImage ... /> to standard <img ... />
    rawBody = rawBody.replace(/<MDXImage\b([^>]*?)\/?>/gis, (_match, attrs: string) => {
        const singleLine = attrs.replace(/\s+/g, ' ');
        const cleanedAttrs = singleLine.replace(/(\w+)=\{([^}]+)\}/g, '$1="$2"');
        return `<img ${cleanedAttrs} />`;
    });

    // Prepend hero image if present and not already referenced in the body
    if (post.image?.src && !rawBody.includes(post.image.src)) {
        const heroUrl = resolveRssImageUrl(post.image.src, siteUrl);
        const heroAlt = post.title.replace(/"/g, '&quot;');
        rawBody = `<p><img src="${heroUrl}" alt="${heroAlt}" /></p>\n\n` + rawBody;
    }

    const rawHtml = mdParser.render(rawBody);

    return sanitizeHtml(rawHtml, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2'],
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
            a: ['href', 'title', 'target', 'rel'],
        },
        transformTags: {
            img: (tagName, attribs) => {
                if (attribs.src) {
                    attribs.src = resolveRssImageUrl(attribs.src, siteUrl);
                }
                return { tagName, attribs };
            },
            a: (tagName, attribs) => {
                if (
                    attribs.href &&
                    !attribs.href.startsWith('http://') &&
                    !attribs.href.startsWith('https://') &&
                    !attribs.href.startsWith('#') &&
                    !attribs.href.startsWith('mailto:')
                ) {
                    attribs.href = new URL(attribs.href, siteUrl).href;
                }
                return { tagName, attribs };
            },
        },
    });
}
