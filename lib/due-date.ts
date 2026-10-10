import { format, isSameYear } from "date-fns";

const DUE_SOON_MS = 24 * 60 * 60 * 1000;

export type DueStatus = "complete" | "overdue" | "due-soon" | "upcoming";

export const getDueStatus = (
    dueDate: Date | string,
    completed: boolean,
    now: Date = new Date(),
): DueStatus => {
    if (completed) return "complete";
    const diff = new Date(dueDate).getTime() - now.getTime();
    if (diff < 0) return "overdue";
    if (diff <= DUE_SOON_MS) return "due-soon";
    return "upcoming";
};

export const DUE_STATUS_STYLES: Record<
    DueStatus,
    { className: string; label?: string }
> = {
    complete: { className: "bg-emerald-600 text-white", label: "Complete" },
    overdue: { className: "bg-red-600 text-white", label: "Overdue" },
    "due-soon": { className: "bg-amber-400 text-amber-950", label: "Due soon" },
    upcoming: { className: "bg-muted text-foreground" },
};

/** "Oct 12" this year, "Oct 12, 2027" otherwise; optionally with time. */
export const formatCardDate = (date: Date | string, withTime = false) => {
    const d = new Date(date);
    const day = isSameYear(d, new Date()) ? "MMM d" : "MMM d, yyyy";
    return format(d, withTime ? `${day}, h:mm a` : day);
};
