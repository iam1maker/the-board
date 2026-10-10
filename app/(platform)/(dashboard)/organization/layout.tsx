import { Sidebar } from "../_components/sidebar";

const OrganizationLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-full bg-background">
            <main className="mx-auto max-w-6xl px-4 pt-20 md:pt-24 2xl:max-w-screen-xl">
                <div className="flex gap-x-8">
                    <aside className="hidden w-64 shrink-0 md:block">
                        <div className="sticky top-24">
                            <Sidebar />
                        </div>
                    </aside>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default OrganizationLayout;
