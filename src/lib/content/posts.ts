import fs from 'fs';
import matter from 'gray-matter';
import { PostMetadata } from '@/types';
import imageSize from 'image-size';
import { normalizeBannerUntil } from '@/lib/utils/date';
import { resolveImage } from '@/lib/assets/images';

let cachedPosts: PostMetadata[] | null = null;

export function clearPostMetadataCache(): void {
    cachedPosts = null;
}

/**
 * Strips the .mdx file extension from an entry id or path.
 */
export function cleanContentSlug(id: string): string {
    return id.replace(/\.mdx$/, '');
}

export function loadPostMetadata(): PostMetadata[] {
    const folder = 'content/posts/';
    const files = fs.readdirSync(folder).filter((file) => file.endsWith('.mdx'));

    const posts = files.map((filename) => {
        const fileContents = fs.readFileSync(`content/posts/${filename}`, 'utf8');
        const matterResult = matter(fileContents);
        const slug = matterResult.data.slug || cleanContentSlug(filename);
        let imgSize: { width?: number; height?: number } | undefined = undefined;
        if (matterResult.data.image) {
            const meta = resolveImage(matterResult.data.image);
            if (meta) {
                imgSize = { width: meta.width, height: meta.height };
            } else {
                try {
                    const imagePath = matterResult.data.image.startsWith('/')
                        ? matterResult.data.image.slice(1)
                        : matterResult.data.image;
                    const buffer = fs.readFileSync(`public/${imagePath}`);
                    imgSize = imageSize(buffer);
                } catch {
                    // Ignore error if image not found
                }
            }
        }

        let banner = undefined;
        if (matterResult.data.banner) {
            const b = matterResult.data.banner;
            const normalizedUntil = normalizeBannerUntil(b.until);
            if (normalizedUntil) {
                banner = {
                    enabled: b.enabled !== false,
                    until: normalizedUntil,
                    text: b.text,
                    badge: b.badge,
                    link: b.link,
                    variant: b.variant,
                    dismissible: b.dismissible !== false,
                };
            }
        } else if (matterResult.data.bannerUntil) {
            const normalizedUntil = normalizeBannerUntil(matterResult.data.bannerUntil);
            if (normalizedUntil) {
                banner = {
                    enabled: true,
                    until: normalizedUntil,
                    text: matterResult.data.bannerText,
                    badge: matterResult.data.bannerBadge,
                    link: matterResult.data.bannerLink,
                    variant: matterResult.data.bannerVariant,
                    dismissible: matterResult.data.bannerDismissible !== false,
                };
            }
        }

        return {
            title: matterResult.data.title,
            date: matterResult.data.date,
            subtitle: matterResult.data.subtitle,
            author: matterResult.data.author,
            slug: slug,
            image: {
                src: matterResult.data.image
                    ? matterResult.data.image.startsWith('/')
                        ? matterResult.data.image
                        : `/${matterResult.data.image}`
                    : '',
                width: imgSize?.width ? imgSize.width : 0,
                height: imgSize?.height ? imgSize.height : 0,
            },
            desc: matterResult.data.desc,
            banner: banner,
            body: matterResult.content,
        };
    });

    posts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB.getTime() - dateA.getTime();
    });

    return posts;
}

export default function getPostMetadata(options?: { forceRefresh?: boolean }): PostMetadata[] {
    if (!cachedPosts || options?.forceRefresh) {
        cachedPosts = loadPostMetadata();
    }
    return cachedPosts;
}

/**
 * Returns a specific post by its slug.
 */
export function getPostBySlug(slug: string): PostMetadata | undefined {
    return getPostMetadata().find((p) => p.slug === slug);
}
