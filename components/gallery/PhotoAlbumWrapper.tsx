'use client';

import PhotoAlbum from 'react-photo-album';
import 'react-photo-album/styles.css';
import { PhotoPlus, TagGroup } from '@/types';
import { useState, useMemo } from 'react';
import GalleryHeader from './GalleryHeader';
import NextPhotoRenderer from './NextPhotoRenderer';

const tagsInit: TagGroup[] = [
    {
        name: 'Jahr',
        tags: ['2018', '2017', '2016'],
        selectedTags: [],
    },
    {
        name: 'Aktion',
        tags: ['Lager', 'Jurtenaktion'],
        selectedTags: [],
    },
    {
        name: 'Gruppe',
        tags: ['Wölflinge', 'Jupfis', 'Pfadis', 'Rover', 'Leiter'],
        selectedTags: [],
    },
];

export default function PhotoAlbumWrapper({ photos }: { photos: PhotoPlus[] }) {
    const [tags, setTags] = useState<TagGroup[]>(tagsInit);

    const filteredPhotos = useMemo(() => {
        return photos.filter((photo: PhotoPlus) =>
            tags.every(
                (group: TagGroup) =>
                    group.selectedTags == undefined ||
                    group.selectedTags.length == 0 ||
                    group.selectedTags.some((tag: string) => photo.tags!.includes(tag))
            )
        );
    }, [tags, photos]);

    return (
        <div>
            <GalleryHeader tags={tags} setTags={setTags} />
            <PhotoAlbum
                photos={filteredPhotos}
                layout="rows"
                render={{ image: NextPhotoRenderer }}
                sizes={{
                    size: '896px',
                    sizes: [
                        { viewport: '(max-width: 896px)', size: 'calc(100vw - 32px)' },
                        { viewport: '(max-width: 559px)', size: 'calc(100vw - 16px)' },
                    ],
                }}
            />
        </div>
    );
}
