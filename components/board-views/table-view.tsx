"use client";

import { useMemo, useState } from "react";
import { Label } from "@prisma/client";
import { format } from "date-fns";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    CheckCircle2,
    CheckSquare,
    MessageSquare,
    Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getDueStatus } from "@/lib/due-date";
import { CardWithListInfo } from "@/lib/board-data";
import { useCardModal } from "@/hooks/use-card-modal";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { ViewPanel } from "./view-panel";
import { CardLabels, labelDisplayName } from "./card-labels";
import { DueBadge } from "./due-badge";

type SortKey = "title" | "list" | "dueDate" | "startDate" | "updatedAt";
type SortDir = "asc" | "desc";
type StatusFilter =
    "all" | "open" | "complete" | "overdue" | "due-soon" | "no-date";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "open", label: "Open" },
    { value: "complete", label: "Complete" },
    { value: "overdue", label: "Overdue" },
    { value: "due-soon", label: "Due soon" },
    { value: "no-date", label: "No due date" },
];

const matchesStatus = (card: CardWithListInfo, status: StatusFilter) => {
    switch (status) {
        case "all":
            return true;
        case "open":
            return !card.completed;
        case "complete":
            return card.completed;
        case "no-date":
            return !card.dueDate;
        default:
            return (
                !!card.dueDate &&
                getDueStatus(card.dueDate, card.completed) === status
            );
    }
};

const timeOf = (value: Date | string | null) =>
    value ? new Date(value).getTime() : null;

/** Sort with empty values last regardless of direction. */
const compareCards = (
    a: CardWithListInfo,
    b: CardWithListInfo,
    key: SortKey,
    listOrder: Map<string, number>,
) => {
    if (key === "title") return a.title.localeCompare(b.title);
    if (key === "list") {
        return (
            (listOrder.get(a.list.id) ?? 0) - (listOrder.get(b.list.id) ?? 0) ||
            a.order - b.order
        );
    }
    const av = timeOf(a[key]);
    const bv = timeOf(b[key]);
    if (av === null && bv === null) return 0;
    if (av === null) return Infinity;
    if (bv === null) return -Infinity;
    return av - bv;
};

interface TableViewProps {
    cards: CardWithListInfo[];
    lists: { id: string; title: string }[];
    labels: Label[];
}

export const TableView = ({ cards, lists, labels }: TableViewProps) => {
    const cardModal = useCardModal();
    const [query, setQuery] = useState("");
    const [listId, setListId] = useState("all");
    const [labelId, setLabelId] = useState("all");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
        key: "list",
        dir: "asc",
    });

    const listOrder = useMemo(
        () => new Map(lists.map((l, i) => [l.id, i])),
        [lists],
    );

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = cards.filter(
            (card) =>
                (!q || card.title.toLowerCase().includes(q)) &&
                (listId === "all" || card.list.id === listId) &&
                (labelId === "all" ||
                    card.labels.some((l) => l.labelId === labelId)) &&
                matchesStatus(card, status),
        );
        return filtered.sort((a, b) => {
            const result = compareCards(a, b, sort.key, listOrder);
            // Keep empty values last in both directions.
            if (!Number.isFinite(result)) return result;
            return sort.dir === "asc" ? result : -result;
        });
    }, [cards, query, listId, labelId, status, sort, listOrder]);

    const toggleSort = (key: SortKey) =>
        setSort((prev) =>
            prev.key === key
                ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { key, dir: "asc" },
        );

    const isFiltered =
        !!query.trim() ||
        listId !== "all" ||
        labelId !== "all" ||
        status !== "all";

    return (
        <ViewPanel
            title="Table"
            description={`${rows.length} of ${cards.length} cards`}
            toolbar={
                <div
                    className="flex flex-wrap items-center gap-2"
                    role="search"
                >
                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search cards"
                            aria-label="Search cards"
                            className="h-8 w-48 pl-8"
                        />
                    </div>
                    <NativeSelect
                        aria-label="Filter by list"
                        value={listId}
                        onChange={(e) => setListId(e.target.value)}
                    >
                        <option value="all">All lists</option>
                        {lists.map((list) => (
                            <option key={list.id} value={list.id}>
                                {list.title}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect
                        aria-label="Filter by label"
                        value={labelId}
                        onChange={(e) => setLabelId(e.target.value)}
                    >
                        <option value="all">All labels</option>
                        {labels.map((label) => (
                            <option key={label.id} value={label.id}>
                                {labelDisplayName(label)}
                            </option>
                        ))}
                    </NativeSelect>
                    <NativeSelect
                        aria-label="Filter by status"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value as StatusFilter)
                        }
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </NativeSelect>
                    {isFiltered && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                setListId("all");
                                setLabelId("all");
                                setStatus("all");
                            }}
                            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            }
        >
            {rows.length === 0 ? (
                <div className="flex h-full min-h-[200px] items-center justify-center p-8 text-sm text-muted-foreground">
                    {cards.length === 0
                        ? "This board has no cards yet."
                        : "No cards match these filters."}
                </div>
            ) : (
                <table className="w-full min-w-[880px] border-separate border-spacing-0 text-sm">
                    <thead className="sticky top-0 z-10 bg-card">
                        <tr className="text-left text-xs font-semibold text-muted-foreground">
                            <SortHeader
                                label="Card"
                                sortKey="title"
                                sort={sort}
                                onSort={toggleSort}
                                className="w-[30%] pl-4"
                            />
                            <SortHeader
                                label="List"
                                sortKey="list"
                                sort={sort}
                                onSort={toggleSort}
                            />
                            <th className="border-b px-3 py-2 font-semibold">
                                Labels
                            </th>
                            <SortHeader
                                label="Due"
                                sortKey="dueDate"
                                sort={sort}
                                onSort={toggleSort}
                            />
                            <SortHeader
                                label="Start"
                                sortKey="startDate"
                                sort={sort}
                                onSort={toggleSort}
                            />
                            <th className="border-b px-3 py-2 font-semibold">
                                Checklist
                            </th>
                            <th className="border-b px-3 py-2 font-semibold">
                                <span className="sr-only">Comments</span>
                                <MessageSquare
                                    className="h-3.5 w-3.5"
                                    aria-hidden
                                />
                            </th>
                            <SortHeader
                                label="Updated"
                                sortKey="updatedAt"
                                sort={sort}
                                onSort={toggleSort}
                                className="pr-4"
                            />
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((card) => (
                            <TableRow
                                key={card.id}
                                card={card}
                                onOpen={() => cardModal.onOpen(card.id)}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </ViewPanel>
    );
};

interface SortHeaderProps {
    label: string;
    sortKey: SortKey;
    sort: { key: SortKey; dir: SortDir };
    onSort: (key: SortKey) => void;
    className?: string;
}

const SortHeader = ({
    label,
    sortKey,
    sort,
    onSort,
    className,
}: SortHeaderProps) => {
    const isActive = sort.key === sortKey;
    const Icon = !isActive
        ? ArrowUpDown
        : sort.dir === "asc"
          ? ArrowUp
          : ArrowDown;
    return (
        <th
            className={cn("border-b px-3 py-2 font-semibold", className)}
            aria-sort={
                isActive
                    ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                    : "none"
            }
        >
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={cn(
                    "inline-flex items-center gap-x-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "text-foreground",
                )}
            >
                {label}
                <Icon className="h-3.5 w-3.5" aria-hidden />
            </button>
        </th>
    );
};

const TableRow = ({
    card,
    onOpen,
}: {
    card: CardWithListInfo;
    onOpen: () => void;
}) => {
    const items = card.checklists.flatMap((c) => c.items);
    const done = items.filter((i) => i.completed).length;
    const cell = "border-b px-3 py-2.5 align-middle";

    return (
        <tr
            onClick={onOpen}
            className="cursor-pointer transition-colors hover:bg-muted/60"
        >
            <td className={cn(cell, "pl-4")}>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen();
                    }}
                    className="flex items-start gap-x-1.5 text-left font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {card.completed && (
                        <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                            aria-label="Complete"
                        />
                    )}
                    <span className="break-words">{card.title}</span>
                </button>
            </td>
            <td className={cn(cell, "text-muted-foreground")}>
                {card.list.title}
            </td>
            <td className={cell}>
                <CardLabels labels={card.labels} />
            </td>
            <td className={cell}>
                {card.dueDate ? (
                    <DueBadge
                        dueDate={card.dueDate}
                        completed={card.completed}
                    />
                ) : (
                    <Empty />
                )}
            </td>
            <td
                className={cn(
                    cell,
                    "whitespace-nowrap tabular-nums text-muted-foreground",
                )}
            >
                {card.startDate ? (
                    format(new Date(card.startDate), "MMM d, yyyy")
                ) : (
                    <Empty />
                )}
            </td>
            <td className={cell}>
                {items.length > 0 ? (
                    <span
                        className={cn(
                            "inline-flex items-center gap-x-1 rounded px-1.5 py-0.5 text-xs tabular-nums",
                            done === items.length
                                ? "bg-emerald-600 text-white"
                                : "text-muted-foreground",
                        )}
                    >
                        <CheckSquare className="h-3.5 w-3.5" aria-hidden />
                        {done}/{items.length}
                    </span>
                ) : (
                    <Empty />
                )}
            </td>
            <td className={cn(cell, "tabular-nums text-muted-foreground")}>
                {card._count.comments > 0 ? card._count.comments : <Empty />}
            </td>
            <td
                className={cn(
                    cell,
                    "whitespace-nowrap pr-4 tabular-nums text-muted-foreground",
                )}
            >
                {format(new Date(card.updatedAt), "MMM d, yyyy")}
            </td>
        </tr>
    );
};

const Empty = () => (
    <span className="text-muted-foreground/60" aria-label="None">
        —
    </span>
);
