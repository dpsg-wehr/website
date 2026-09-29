declare module '@/content/global/index.json' {
    export interface GlobalNavSubItem {
        label: string;
        link: string;
        icon: string;
        color?: string;
    }

    export interface GlobalNavItem {
        label: string;
        link: string;
        icon: string;
        links?: GlobalNavSubItem[];
    }

    export interface GlobalFooterLink {
        text: string;
        url: string;
        external: boolean;
    }

    export interface GlobalFooterColumn {
        title: string;
        links: GlobalFooterLink[];
    }

    export interface GlobalSocial {
        facebook: string;
        instagram: string;
    }

    export interface GlobalBanner {
        id?: string;
        enabled?: boolean;
        text?: string;
        link?: string;
        until: string;
        badge?: string;
        variant?: string;
        dismissible?: boolean;
    }

    export interface GlobalData {
        header: {
            nav: GlobalNavItem[];
        };
        footer: {
            social: GlobalSocial;
            columns: GlobalFooterColumn[];
        };
        banner?: GlobalBanner;
    }

    const value: GlobalData;
    export default value;
}
