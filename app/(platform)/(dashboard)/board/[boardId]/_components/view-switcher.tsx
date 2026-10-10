"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    CalendarDays,
    GanttChart,
    Kanban,
    Table2,
    type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type View = { segment: string; label: string; icon: LucideIcon };

const VIEWS: View[] = [
    { segment: "", label: "Board", icon: Kanban },
    { segment: "table", label: "Table", icon: Table2 },
    { segment: "calendar", label: "Calendar", icon: CalendarDays },
    { segment: "timeline", label: "Timeline", icon: GanttChart },
    { segment: "dashboard", label: "Dashboard", icon: BarChart3 },
];

export const ViewSwitcher = ({ boardId }: { boardId: string }) => {
    const pathname = usePathname();
    const base = `/board/${boardId}`;

    return (
        <nav aria-label="Board views" className="min-w-0 overflow-x-auto">
            <ul className="flex items-center gap-1">
                {VIEWS.map(({ segment, label, icon: Icon }) => {
                    const href = segment ? `${base}/${segment}` : base;
                    const isActive = pathname === href;
                    return (
                        <li key={label}>
                            <Link
                                href={href}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "flex h-8 items-center gap-x-1.5 rounded-md px-2.5 text-sm font-medium text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                                    isActive &&
                                        "bg-white text-foreground hover:bg-white hover:text-foreground",
                                )}
                            >
                                <Icon className="h-4 w-4" aria-hidden />
                                <span className="hidden lg:inline">
                                    {label}
                                </span>
                                <span className="sr-only lg:hidden">
                                    {label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};
