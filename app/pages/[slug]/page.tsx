import { getMdxStaticParams, getMdxPageMetadata, renderMdxPage } from '@/lib/content/mdxPage';
import { Metadata } from 'next';

export async function generateStaticParams() {
    return getMdxStaticParams('pages', ['startseite.mdx', 'gallerie.mdx']);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    return getMdxPageMetadata('pages', params);
}

export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
    return renderMdxPage('pages', params);
}
