import { createContext, useContext } from 'react';

interface SidebarContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

export const SidebarContext = createContext<SidebarContextType>({
    isOpen: false,
    toggle: () => {},
    close: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
