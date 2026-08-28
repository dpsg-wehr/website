import getPostMetadata from '@/lib/content/posts';
import PostPreview from './PostPreview';
import { formatPostDate } from '@/lib/utils/date';

export default function RecentPosts() {
    const postMetadata = getPostMetadata();
    const recentPosts = postMetadata.slice(0, 2);

    if (recentPosts.length === 0) return null;

    return (
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 justify-items-center gap-4 mx-auto sm:ml-0 no-underline">
            {recentPosts.map((post, index) => (
                <PostPreview
                    key={post.slug}
                    {...post}
                    priority={index === 0}
                    date={formatPostDate(post.date)}
                />
            ))}
        </div>
    );
}
