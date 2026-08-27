import getPostMetadata from '@/lib/content/posts';
import globalData from '@/content/global/index.json';
import { BannerConfig } from '@/types';
import { normalizeBannerUntil } from '@/lib/utils/date';

export function getActiveBanner(): BannerConfig | null {
    const posts = getPostMetadata();
    const candidateBanners: BannerConfig[] = [];

    // 1. Collect banners from posts (sorted by post date descending)
    for (const post of posts) {
        if (post.banner && post.banner.enabled !== false && post.banner.until) {
            const normalizedUntil = normalizeBannerUntil(post.banner.until);
            if (!normalizedUntil) continue;

            candidateBanners.push({
                id: `post-${post.slug}-${normalizedUntil}`,
                text:
                    post.banner.text ||
                    `${post.title}${post.subtitle ? ` – ${post.subtitle}` : ''}`,
                link: post.banner.link || `/posts/${post.slug}`,
                until: normalizedUntil,
                badge: post.banner.badge || 'Aktion',
                variant: post.banner.variant || 'amber',
                dismissible: post.banner.dismissible !== false,
            });
        }
    }

    // 2. Global banner from globalData if defined
    const globalBanner = globalData?.banner;
    if (globalBanner && globalBanner.enabled !== false && globalBanner.until) {
        const normalizedUntil = normalizeBannerUntil(globalBanner.until);
        if (normalizedUntil) {
            candidateBanners.push({
                id: globalBanner.id || `global-${normalizedUntil}`,
                text: globalBanner.text || 'Ankündigung',
                link: globalBanner.link || '/',
                until: normalizedUntil,
                badge: globalBanner.badge || 'Info',
                variant: globalBanner.variant || 'amber',
                dismissible: globalBanner.dismissible !== false,
            });
        }
    }

    if (candidateBanners.length === 0) {
        return null;
    }

    // Return the latest active banner
    return candidateBanners[0];
}
