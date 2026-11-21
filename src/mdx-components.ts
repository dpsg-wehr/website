import Acrostichon from '@/components/mdx/Acrostichon';
import CalendarWrapper from '@/components/mdx/CalendarWrapper.astro';
import CampflowForm from '@/components/mdx/CampflowForm.astro';
import CampflowScript from '@/components/mdx/CampflowScript.astro';
import Download from '@/components/mdx/Download';
import GroupOverview from '@/components/mdx/GroupOverview';
import MDXImage from '@/components/mdx/MDXImage.astro';
import OsmMap from '@/components/mdx/OsmMap.astro';
import UmamiOptOutWrapper from '@/components/mdx/UmamiOptOutWrapper.astro';
import RecentPosts from '@/components/posts/RecentPosts.astro';

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
    UmamiOptOut: UmamiOptOutWrapper,
    AnalyticsOptOut: UmamiOptOutWrapper,
    OsmMap: OsmMap,
    OSMMap: OsmMap,
    Map: OsmMap,
};
