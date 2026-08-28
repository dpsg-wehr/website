import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/mdx-components';
import { Metadata } from 'next';

const filePath = path.join(process.cwd(), 'content/pages/gallerie.mdx');

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Fotos - DPSG Wehr',
        description:
            'Einblicke in unsere Zeltlager, Gruppenstunden und Aktionen. Entdecke unsere Fotogallerie!',
        openGraph: {
            title: 'Fotos - DPSG Wehr',
            description:
                'Einblicke in unsere Zeltlager, Gruppenstunden und Aktionen. Entdecke unsere Fotogallerie!',
            images: ['/media/images/logo.png'],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'Fotos - DPSG Wehr',
            description:
                'Einblicke in unsere Zeltlager, Gruppenstunden und Aktionen. Entdecke unsere Fotogallerie!',
            images: ['/media/images/logo.png'],
        },
    };
}
export default function GalleryPage() {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { content } = matter(fileContents);

    return (
        <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
                blockJS: false,
            }}
        />
    );
}
