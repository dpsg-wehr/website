import { Photo } from 'react-photo-album';
import { Icons } from '@/lib/icons';

export interface BannerConfig {
    id: string;
    text: string;
    link: string;
    until: string;
    badge?: string;
    variant?: 'amber' | 'blue' | 'green' | 'red' | (string & {});
    dismissible?: boolean;
}

export interface PostMetadata {
    title: string;
    date: string;
    subtitle: string;
    author: string;
    slug: string;
    image: {
        src: string;
        width: number;
        height: number;
    };
    desc: string;
    banner?: {
        enabled?: boolean;
        until: string;
        text?: string;
        badge?: string;
        link?: string;
        variant?: 'amber' | 'blue' | 'green' | 'red' | (string & {});
        dismissible?: boolean;
    };
}

export interface AcrostichonData {
    left: string;
    middle: string;
    right: string;
}

export interface PhotoPlus extends Photo {
    tags?: string[];
    optimizedSrc?: string;
}

export interface TagGroup {
    name: string;
    tags: string[];
    selectedTags: string[];
}

export interface AppEvent {
    title: string;
    start: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
    end?: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm
    location?: string;
    description?: string;
}

export interface NavigationLinkGroup {
    label: string;
    link: string;
    Icon?: Icons;
    links?: Array<NavigationLink>;
}

export interface NavigationLink {
    label: string;
    link: string;
    Icon: Icons;
    color?: string;
}
