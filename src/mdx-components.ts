import MDXImage from '@/src/components/mdx/MDXImage.astro';
import Acrostichon from '@/components/mdx/Acrostichon';
import GroupOverview from '@/components/mdx/GroupOverview';
import CalendarWrapper from '@/src/components/mdx/CalendarWrapper.astro';
import Download from '@/components/mdx/Download';
import RecentPosts from '@/src/components/posts/RecentPosts.astro';

export const mdxComponents = {
    img: MDXImage,
    MDXImage: MDXImage,
    Img: MDXImage,
    Acrostichon: Acrostichon,
    GroupOverview: GroupOverview,
    Calendar: CalendarWrapper,
    Download: Download,
    RecentPosts: RecentPosts,
};
