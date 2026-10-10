import type { LucideIcon } from "lucide-react";

interface SectionHeadingProps {
    icon: LucideIcon;
    children: React.ReactNode;
    action?: React.ReactNode;
}

export const SectionHeading = ({
    icon: Icon,
    children,
    action,
}: SectionHeadingProps) => {
    return (
        <div className="mb-3 flex items-center gap-x-2">
            <span className="flex w-6 shrink-0 justify-center">
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            </span>
            <h3 className="text-sm font-semibold text-foreground">
                {children}
            </h3>
            {action && <div className="ml-auto">{action}</div>}
        </div>
    );
};
