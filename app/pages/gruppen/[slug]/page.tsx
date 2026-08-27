import { getMdxStaticParams, getMdxPageMetadata, renderMdxPage } from '@/lib/content/mdxPage';
import { Metadata } from 'next';

export async function generateStaticParams() {
    return getMdxStaticParams('gruppen');
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    return getMdxPageMetadata('gruppen', params);
}

export default async function GroupPage({ params }: { params: Promise<{ slug: string }> }) {
    return renderMdxPage('gruppen', params);
}
