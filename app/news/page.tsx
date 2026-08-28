import getPostMetadata from '@/lib/content/posts';
import PostPreview from '@/components/posts/PostPreview';
import { formatPostDate } from '@/lib/utils/date';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Aktuelles - DPSG Wehr',
    description: 'Neuigkeiten und Berichte von unseren Aktionen, Zeltlagern und Gruppenstunden.',
    openGraph: {
        title: 'Aktuelles - DPSG Wehr',
        description:
            'Neuigkeiten und Berichte von unseren Aktionen, Zeltlagern und Gruppenstunden.',
        images: ['/media/images/logo.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Aktuelles - DPSG Wehr',
        description:
            'Neuigkeiten und Berichte von unseren Aktionen, Zeltlagern und Gruppenstunden.',
        images: ['/media/images/logo.png'],
    },
};

export default function Aktuelles() {
    const postMetadata = getPostMetadata();
    const postPreviews = postMetadata.map((data, index) => {
        const formattedData = { ...data, date: formatPostDate(data.date) };

        return <PostPreview key={formattedData.slug} {...formattedData} priority={index < 2} />;
    });

    return (
        <>
            <div className="prose dark:prose-invert mb-8 max-w-none">
                <h1>Aktuelles</h1>
                <p>
                    Hier findet ihr aktuelle Berichte und Informationen über unsere Aktivitäten. Ob
                    Zeltlager, Stammesaktionen oder Neuigkeiten aus den Gruppen - bleibt auf dem
                    Laufenden!
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto sm:max-w-max">
                {postPreviews}
            </div>

            {postPreviews.length === 0 && (
                <div className="text-center mt-8">
                    <p className="text-xl font-bold">Hier gibt&apos;s noch nichts zu sehen.</p>
                </div>
            )}
        </>
    );
}
