import MDXImage from '@/components/mdx/MDXImage.astro';
import Acrostichon from '@/components/mdx/Acrostichon';
import GroupOverview from '@/components/mdx/GroupOverview';
import CalendarWrapper from '@/components/mdx/CalendarWrapper.astro';
import Download from '@/components/mdx/Download';
import RecentPosts from '@/components/posts/RecentPosts.astro';
import CampflowForm from '@/components/mdx/CampflowForm.astro';
import CampflowScript from '@/components/mdx/CampflowScript.astro';

export const mdxComponents = {
    img: MDXImage,
    MDXImage: MDXImage,
    Img: MDXImage,
    Acrostichon: Acrostichon,
    GroupOverview: GroupOverview,
    Calendar: CalendarWrapper,
    Download: Download,
    RecentPosts: RecentPosts,
    CampflowForm: CampflowForm,
    Campflow: CampflowForm,
    script: CampflowScript,
};
