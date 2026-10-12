import Lilie from '@/components/mdx/Lilie';
import {
    IoNewspaper,
    IoPeople,
    IoImage,
    IoCalendarOutline,
    IoHelpCircle,
    IoHome,
    IoSearchOutline,
    IoEllipsisHorizontal,
    IoDocumentOutline,
    IoMailOutline,
} from 'react-icons/io5';

export type Icons =
    | 'Lilie'
    | 'None'
    | 'News'
    | 'People'
    | 'Image'
    | 'Calendar'
    | 'Help'
    | 'House'
    | 'Search'
    | 'More'
    | 'File'
    | 'Mail';

export const getIconFromName = (iconsName: Icons, color?: string): React.JSX.Element | null => {
    switch (iconsName) {
        case 'Lilie':
            return <Lilie color={color} />;
        case 'File':
            return <IoDocumentOutline />;
        case 'Mail':
            return <IoMailOutline />;
        case 'More':
            return <IoEllipsisHorizontal />;
        case 'Search':
            return <IoSearchOutline />;
        case 'News':
            return <IoNewspaper />;
        case 'People':
            return <IoPeople />;
        case 'Image':
            return <IoImage />;
        case 'Calendar':
            return <IoCalendarOutline />;
        case 'Help':
            return <IoHelpCircle />;
        case 'House':
            return <IoHome />;
        default:
            return null;
    }
};
