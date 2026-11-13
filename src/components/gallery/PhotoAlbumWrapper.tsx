import { useState, useMemo } from 'react';

import 'react-photo-album/styles.css';
import PhotoAlbum from 'react-photo-album';

import { buildPhotoTagGroups } from '@/lib/content/photos-tags';
import { PhotoPlus, TagGroup } from '@/types';

import GalleryHeader from './GalleryHeader';
import PhotoRenderer from './PhotoRenderer';

export default function PhotoAlbumWrapper({ photos }: { photos: PhotoPlus[] }) {
    const initialTags = useMemo(() => buildPhotoTagGroups(photos), [photos]);
    const [tags, setTags] = useState<TagGroup[]>(initialTags);

    const filteredPhotos = useMemo(() => {
        return photos.filter((photo: PhotoPlus) =>
            tags.every(
                (group: TagGroup) =>
                    group.selectedTags == undefined ||
                    group.selectedTags.length == 0 ||
                    group.selectedTags.some((tag: string) => photo.tags?.includes(tag))
            )
        );
    }, [tags, photos]);

    return (
        <div>
            <GalleryHeader tags={tags} setTags={setTags} />
            <PhotoAlbum
                photos={filteredPhotos}
                layout="rows"
                render={{ image: PhotoRenderer }}
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
