import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Metadata } from 'next';
import getPostMetadata from '@/lib/content/posts';
import { mdxComponents } from '@/mdx-components';
import Post from '@/components/posts/Post';
import rehypeImgSize from 'rehype-img-size';
import { getExcerpt, getOptimizedImageMetadata } from '@/lib/utils/metadata';

export async function generateStaticParams() {
    const posts = getPostMetadata();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const description = (data.desc || data.description || getExcerpt(content)) as string;
    const postMetadata = getPostMetadata();
    const metadata = postMetadata.find((post) => post.slug === slug);

    let images: { url: string; width: number; height: number }[] = [
        {
            url: '/media/images/logo.png',
            width: 800,
            height: 800,
        },
    ];

    if (metadata?.image.src) {
        const optimized = getOptimizedImageMetadata(
            metadata.image.src,
            metadata.image.width,
            metadata.image.height
        );
        if (optimized) {
            images = [optimized];
        } else {
            images = [
                {
                    url: metadata.image.src,
                    width: metadata.image.width,
                    height: metadata.image.height,
                },
            ];
        }
    }

    return {
        title: `${data.title} - DPSG Wehr`,
        description: description,
        openGraph: {
            title: `${data.title} - DPSG Wehr`,
            description: description,
            type: 'article',
            publishedTime: data.date as string,
            authors: [data.author as string],
            images: images,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${data.title} - DPSG Wehr`,
            description: description,
            images: images.map((img) => img.url),
        },
    };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postMetadata = getPostMetadata();
    const filePath = path.join(process.cwd(), 'content/posts', `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const eventJsonLd = data.event
        ? {
              '@context': 'https://schema.org',
              '@type': 'Event',
              name: data.event.name || data.title,
              description: (data.desc || data.description || getExcerpt(content)) as string,
              startDate: data.event.startDate,
              endDate: data.event.endDate,
              eventAttendanceMode:
                  data.event.eventAttendanceMode || 'https://schema.org/OfflineEventAttendanceMode',
              eventStatus: data.event.eventStatus || 'https://schema.org/EventScheduled',
              location: data.event.location
                  ? {
                        '@type': 'Place',
                        name: data.event.location.name,
                        description: data.event.location.description,
                        hasMap: data.event.location.hasMap,
                        geo: data.event.location.geo
                            ? {
                                  '@type': 'GeoCoordinates',
                                  latitude: data.event.location.geo.latitude,
                                  longitude: data.event.location.geo.longitude,
                              }
                            : undefined,
                        address: data.event.location.address
                            ? {
                                  '@type': 'PostalAddress',
                                  ...data.event.location.address,
                              }
                            : undefined,
                    }
                  : undefined,
              image: data.image
                  ? [`https://dpsg-wehr.de${data.image}`]
                  : ['https://dpsg-wehr.de/media/images/logo.png'],
              isAccessibleForFree: data.event.isAccessibleForFree ?? true,
              organizer: {
                  '@type': 'NGO',
                  name: 'DPSG Stamm St. Bernhard Wehr',
                  url: 'https://dpsg-wehr.de',
              },
          }
        : null;

    return (
        <>
            {eventJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
                />
            )}
            <Post postMetadata={postMetadata} slug={slug}>
                <MDXRemote
                    source={content}
                    components={mdxComponents}
                    options={{
                        blockJS: false,
                        mdxOptions: {
                            rehypePlugins: [[rehypeImgSize as never, { dir: 'public' }]],
                        },
                    }}
                />
            </Post>
        </>
    );
}
