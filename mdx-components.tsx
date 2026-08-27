import type { MDXComponents } from 'mdx/types';
import MDXImage from '@/components/mdx/MDXImage';
import Img from '@/components/mdx/Img';
import Acrostichon from '@/components/mdx/Acrostichon';
import GroupOverview from '@/components/mdx/GroupOverview';
import Calendar from '@/components/mdx/DynamicCalendar';
import Download from '@/components/mdx/Download';
import RecentPosts from '@/components/posts/RecentPosts';

export const mdxComponents: MDXComponents = {
    img: (props) => <MDXImage {...props} />,
    MDXImage: (props: React.ComponentPropsWithoutRef<typeof MDXImage>) => <MDXImage {...props} />,
    Img: (props: React.ComponentPropsWithoutRef<typeof Img>) => <Img {...props} />,
    Acrostichon: (props: React.ComponentPropsWithoutRef<typeof Acrostichon>) => (
        <Acrostichon {...props} />
    ),
    GroupOverview: (props: React.ComponentPropsWithoutRef<typeof GroupOverview>) => (
        <GroupOverview {...props} />
    ),
    Calendar: () => <Calendar />,
    Download: (props: React.ComponentPropsWithoutRef<typeof Download>) => <Download {...props} />,
    RecentPosts: () => <RecentPosts />,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...mdxComponents,
        ...components,
    };
}
