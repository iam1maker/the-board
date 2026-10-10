import { cn } from "@/lib/utils";

interface ViewPanelProps {
    title: string;
    description?: string;
    toolbar?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

/** White surface that board views (table, calendar…) render on top of the board background. */
export const ViewPanel = ({
    title,
    description,
    toolbar,
    children,
    className,
}: ViewPanelProps) => (
    <section
        aria-label={title}
        className={cn(
            "flex h-full min-h-0 flex-col rounded-xl bg-card/95 shadow-lg ring-1 ring-black/5 backdrop-blur",
            className,
        )}
    >
        <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
            <div className="mr-auto">
                <h2 className="text-base font-semibold text-foreground">
                    {title}
                </h2>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {toolbar}
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
);
