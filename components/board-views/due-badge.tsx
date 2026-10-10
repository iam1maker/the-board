import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    DUE_STATUS_STYLES,
    formatCardDate,
    getDueStatus,
} from "@/lib/due-date";

/** Due date with its status color and a text label (never color alone). */
export const DueBadge = ({
    dueDate,
    completed,
}: {
    dueDate: Date | string;
    completed: boolean;
}) => {
    const status = getDueStatus(dueDate, completed);
    const style = DUE_STATUS_STYLES[status];
    return (
        <span
            className={cn(
                "inline-flex items-center gap-x-1 whitespace-nowrap rounded px-1.5 py-0.5 text-xs",
                style.className,
            )}
        >
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {formatCardDate(dueDate, true)}
            {style.label && <span className="sr-only"> ({style.label})</span>}
        </span>
    );
};
