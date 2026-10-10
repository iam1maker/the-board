"use client";

import { Label } from "@prisma/client";
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    CircleDashed,
    Clock,
    type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CardWithListInfo } from "@/lib/board-data";
import { getDueStatus } from "@/lib/due-date";
import { LABEL_COLORS, LabelColor } from "@/constants/labels";
import { HBarChart, BarRow } from "./bar-chart";
import { labelDisplayName } from "./card-labels";

const DAY_MS = 24 * 60 * 60 * 1000;
const DUE_WINDOW_DAYS = 7;

/**
 * Chart colors (validated with the dataviz skill's validator):
 * - complete/open: one-hue ordinal teal pair (teal-800 / teal-500, passes on white)
 * - due status: the fixed status palette, always shown with an icon + text label
 */
const SERIES = {
    complete: "#115e59",
    open: "#14b8a6",
};
const STATUS = {
    overdue: { color: "#d03b3b", label: "Overdue", icon: AlertTriangle },
    "due-soon": { color: "#fab219", label: "Due soon", icon: Clock },
    upcoming: { color: "#94a3b8", label: "Upcoming", icon: CalendarClock },
    complete: { color: "#0ca30c", label: "Complete", icon: CheckCircle2 },
    none: { color: "#cbd5e1", label: "No due date", icon: CircleDashed },
} satisfies Record<string, { color: string; label: string; icon: LucideIcon }>;

const percent = (part: number, whole: number) =>
    whole === 0 ? 0 : Math.round((part / whole) * 100);

interface DashboardViewProps {
    cards: CardWithListInfo[];
    lists: { id: string; title: string }[];
    labels: Label[];
}

export const DashboardView = ({ cards, lists, labels }: DashboardViewProps) => {
    const now = Date.now();
    const total = cards.length;
    const completed = cards.filter((c) => c.completed).length;
    const overdue = cards.filter(
        (c) => c.dueDate && getDueStatus(c.dueDate, c.completed) === "overdue",
    ).length;
    const dueThisWeek = cards.filter((c) => {
        if (!c.dueDate || c.completed) return false;
        const t = new Date(c.dueDate).getTime();
        return t >= now && t - now <= DUE_WINDOW_DAYS * DAY_MS;
    }).length;
    const items = cards.flatMap((c) => c.checklists.flatMap((cl) => cl.items));
    const itemsDone = items.filter((i) => i.completed).length;

    const listRows: BarRow[] = lists.map((list) => {
        const inList = cards.filter((c) => c.list.id === list.id);
        const done = inList.filter((c) => c.completed).length;
        return {
            key: list.id,
            label: list.title,
            labelText: list.title,
            segments: [
                { name: "Complete", value: done, color: SERIES.complete },
                {
                    name: "Open",
                    value: inList.length - done,
                    color: SERIES.open,
                },
            ],
        };
    });

    const statusCounts = {
        overdue: 0,
        "due-soon": 0,
        upcoming: 0,
        complete: 0,
        none: 0,
    };
    for (const card of cards) {
        if (card.completed) statusCounts.complete += 1;
        else if (!card.dueDate) statusCounts.none += 1;
        else statusCounts[getDueStatus(card.dueDate, false)] += 1;
    }
    const statusRows: BarRow[] = (
        Object.keys(STATUS) as (keyof typeof STATUS)[]
    ).map((key) => {
        const { color, label, icon: Icon } = STATUS[key];
        return {
            key,
            labelText: label,
            label: (
                <span className="inline-flex items-center gap-x-1.5">
                    <Icon
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden
                    />
                    {label}
                </span>
            ),
            segments: [{ name: "Cards", value: statusCounts[key], color }],
        };
    });

    const labelRows: BarRow[] = labels
        .map((label) => ({
            key: label.id,
            labelText: labelDisplayName(label),
            label: labelDisplayName(label),
            segments: [
                {
                    name: "Cards",
                    value: cards.filter((c) =>
                        c.labels.some((l) => l.labelId === label.id),
                    ).length,
                    color:
                        LABEL_COLORS[label.color as LabelColor]?.hex ??
                        LABEL_COLORS.slate.hex,
                },
            ],
        }))
        .filter((row) => row.segments[0].value > 0)
        .sort((a, b) => b.segments[0].value - a.segments[0].value);
    const unlabeled = cards.filter((c) => c.labels.length === 0).length;
    if (unlabeled > 0) {
        labelRows.push({
            key: "none",
            labelText: "No label",
            label: <span className="text-muted-foreground">No label</span>,
            segments: [
                { name: "Cards", value: unlabeled, color: STATUS.none.color },
            ],
        });
    }

    return (
        <div className="h-full overflow-auto rounded-xl bg-card/95 shadow-lg ring-1 ring-black/5 backdrop-blur">
            <div className="space-y-6 p-4 md:p-6">
                <header>
                    <h2 className="text-base font-semibold text-foreground">
                        Dashboard
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        A snapshot of this board. Use the table view for the
                        card-by-card data.
                    </p>
                </header>

                <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    <StatTile label="Cards" value={total} />
                    <StatTile
                        label="Completed"
                        value={`${percent(completed, total)}%`}
                        detail={`${completed} of ${total}`}
                    />
                    <StatTile
                        label="Overdue"
                        value={overdue}
                        detail={
                            overdue > 0 ? "Needs attention" : "All on track"
                        }
                    />
                    <StatTile label="Due in 7 days" value={dueThisWeek} />
                    <StatTile
                        label="Checklist items"
                        value={
                            items.length
                                ? `${percent(itemsDone, items.length)}%`
                                : "—"
                        }
                        detail={
                            items.length
                                ? `${itemsDone} of ${items.length} done`
                                : "No checklists"
                        }
                    />
                </ul>

                <div className="grid gap-4 xl:grid-cols-2">
                    <ChartCard title="Cards per list" className="xl:col-span-2">
                        <HBarChart
                            rows={listRows}
                            emptyText="No lists yet"
                            legend={[
                                { name: "Complete", color: SERIES.complete },
                                { name: "Open", color: SERIES.open },
                            ]}
                        />
                    </ChartCard>
                    <ChartCard title="Due status">
                        <HBarChart rows={statusRows} emptyText="No cards yet" />
                    </ChartCard>
                    <ChartCard title="Cards by label">
                        <HBarChart rows={labelRows} emptyText="No cards yet" />
                    </ChartCard>
                </div>
            </div>
        </div>
    );
};

const StatTile = ({
    label,
    value,
    detail,
}: {
    label: string;
    value: number | string;
    detail?: string;
}) => (
    <li className="rounded-lg border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        {detail && (
            <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        )}
    </li>
);

const ChartCard = ({
    title,
    children,
    className,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <section
        aria-label={title}
        className={cn("rounded-lg border bg-card p-4", className)}
    >
        <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
        {children}
    </section>
);
