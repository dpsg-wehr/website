import fs from 'fs';
import matter from 'gray-matter';
import { PostMetadata } from '@/types';
import imageSize from 'image-size';
import { normalizeBannerUntil } from '@/lib/date';

export default function getPostMetadata(): PostMetadata[] {
    const folder = 'content/posts/';

    const files = fs.readdirSync(folder).filter((file) => file.endsWith('.mdx'));

    const posts = files.map((filename) => {
        const slug = filename.replace('.mdx', '');
        const fileContents = fs.readFileSync(`content/posts/${filename}`, 'utf8');
        const matterResult = matter(fileContents);
        let imgSize = undefined;
        if (matterResult.data.image) {
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
        };
    });

    posts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        return dateB.getTime() - dateA.getTime();
    });

    return posts;
}
