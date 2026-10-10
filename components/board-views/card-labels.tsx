import { Label } from "@prisma/client";

import { cn } from "@/lib/utils";
import { LABEL_COLORS, LabelColor } from "@/constants/labels";

export const labelDisplayName = (label: Pick<Label, "name" | "color">) =>
    label.name || LABEL_COLORS[label.color as LabelColor]?.name || label.color;

/** Small colored label chips (name shown when the label has one). */
export const CardLabels = ({
    labels,
    className,
}: {
    labels: { label: Label }[];
    className?: string;
}) => {
    if (labels.length === 0) return null;
    return (
        <span className={cn("flex flex-wrap gap-1", className)}>
            {labels.map(({ label }) => (
                <span
                    key={label.id}
                    title={labelDisplayName(label)}
                    className={cn(
                        "inline-flex h-5 min-w-[32px] items-center truncate rounded px-1.5 text-[11px] font-semibold",
                        LABEL_COLORS[label.color as LabelColor]?.className,
                    )}
                >
                    {label.name}
                </span>
            ))}
        </span>
    );
};
