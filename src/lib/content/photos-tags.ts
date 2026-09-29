import type { PhotoPlus, TagGroup } from '@/types';

export const KNOWN_SCOUT_GROUPS = ['Wölflinge', 'Jupfis', 'Pfadis', 'Rover', 'Leiter'];

/**
 * Dynamically derives structured filter tag groups (Jahr, Aktion, Gruppe)
 * from a list of photos with tags.
 */
export function buildPhotoTagGroups(
    photos: PhotoPlus[],
    selectedMap: Record<string, string[]> = {}
): TagGroup[] {
    const allTags = new Set<string>();

    for (const photo of photos) {
        if (photo.tags && Array.isArray(photo.tags)) {
            for (const tag of photo.tags) {
                if (tag.trim()) {
                    allTags.add(tag.trim());
                }
            }
        }
    }

    const yearRegex = /^\d{4}$/;
    const years: string[] = [];
    const groups: string[] = [];
    const actions: string[] = [];

    for (const tag of allTags) {
        if (yearRegex.test(tag)) {
            years.push(tag);
        } else if (KNOWN_SCOUT_GROUPS.includes(tag)) {
            groups.push(tag);
        } else {
            actions.push(tag);
        }
    }

    // Sort years descending (newest first)
    years.sort((a, b) => Number(b) - Number(a));

    // Sort groups according to scout progression hierarchy
    groups.sort((a, b) => {
        const indexA = KNOWN_SCOUT_GROUPS.indexOf(a);
        const indexB = KNOWN_SCOUT_GROUPS.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    // Sort actions alphabetically
    actions.sort((a, b) => a.localeCompare(b, 'de'));

    return [
        {
            name: 'Jahr',
            tags: years.length > 0 ? years : ['2018', '2017', '2016'],
            selectedTags: selectedMap['Jahr'] || [],
        },
        {
            name: 'Aktion',
            tags: actions.length > 0 ? actions : ['Lager', 'Jurtenaktion'],
            selectedTags: selectedMap['Aktion'] || [],
        },
        {
            name: 'Gruppe',
            tags: groups.length > 0 ? groups : KNOWN_SCOUT_GROUPS,
            selectedTags: selectedMap['Gruppe'] || [],
        },
    ];
}
