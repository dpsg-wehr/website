import { describe, it, expect } from 'vitest';
import { buildPhotoTagGroups } from './photos-tags';
import type { PhotoPlus } from '@/types';

describe('buildPhotoTagGroups', () => {
    it('returns default fallback groups when photos have no tags', () => {
        const groups = buildPhotoTagGroups([]);
        expect(groups).toHaveLength(3);
        expect(groups[0].name).toBe('Jahr');
        expect(groups[1].name).toBe('Aktion');
        expect(groups[2].name).toBe('Gruppe');
    });

    it('extracts years sorted descending and separates actions and groups', () => {
        const samplePhotos: PhotoPlus[] = [
            {
                src: '/img1.jpg',
                width: 100,
                height: 100,
                tags: ['2016', 'Lager', 'Wölflinge'],
            },
            {
                src: '/img2.jpg',
                width: 100,
                height: 100,
                tags: ['2024', 'Rover', 'Sommerlager', '2018'],
            },
        ];

        const groups = buildPhotoTagGroups(samplePhotos);
        const yearGroup = groups.find((g) => g.name === 'Jahr');
        const actionGroup = groups.find((g) => g.name === 'Aktion');
        const scoutGroup = groups.find((g) => g.name === 'Gruppe');

        expect(yearGroup?.tags).toEqual(['2024', '2018', '2016']);
        expect(actionGroup?.tags).toContain('Lager');
        expect(actionGroup?.tags).toContain('Sommerlager');
        expect(scoutGroup?.tags).toEqual(['Wölflinge', 'Rover']);
    });
});
