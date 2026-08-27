import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/mdx-components';
import rehypeImgSize from 'rehype-img-size';
import { getExcerpt } from '@/lib/utils/metadata';

export function getMdxStaticParams(contentSubdir: string, excludeFiles: string[] = []) {
    const folder = path.join(process.cwd(), 'content', contentSubdir);
    if (!fs.existsSync(folder)) return [];
    const files = fs.readdirSync(folder).filter((file) => file.endsWith('.mdx'));

    return files
        .filter((file) => !excludeFiles.includes(file))
        .map((filename) => ({
            slug: filename.replace('.mdx', ''),
        }));
}

export async function getMdxPageMetadata(
    contentSubdir: string,
    params: Promise<{ slug: string }>
): Promise<Metadata> {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'content', contentSubdir, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const description = getExcerpt(content);

    return {
        title: `${data.title} - DPSG Wehr`,
        description: description,
        openGraph: {
            title: `${data.title} - DPSG Wehr`,
            description: description,
            type: 'website',
            images: [
                {
                    url: '/media/images/logo.png',
                    width: 800,
                    height: 800,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${data.title} - DPSG Wehr`,
            description: description,
            images: ['/media/images/logo.png'],
        },
    };
}

export async function renderMdxPage(contentSubdir: string, params: Promise<{ slug: string }>) {
    const { slug } = await params;
    const filePath = path.join(process.cwd(), 'content', contentSubdir, `${slug}.mdx`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(fileContents);

    return (
        <article className="prose sm:prose-lg dark:prose-invert max-w-none">
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
        </article>
    );
}
