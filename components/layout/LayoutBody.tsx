import SidebarWrapper from './SidebarWrapper';

export default function LayoutBody({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 flex flex-col relative">
            <SidebarWrapper />
            <main className="max-w-4xl w-full mx-auto px-2 sm:px-4 my-12 md:my-20 flex-1">
                {children}
            </main>
        </div>
    );
}
