"use client";

import { useState } from "react";
import { Trash } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ConfirmButtonProps {
    label: string;
    confirmLabel: string;
    onConfirm: () => void;
    disabled?: boolean;
    className?: string;
    confirmClassName?: string;
}

/**
 * Two-step destructive action: the first click asks for confirmation inline,
 * which avoids opening a dialog from inside a popover (closing the popover
 * would unmount it).
 */
export const ConfirmButton = ({
    label,
    confirmLabel,
    onConfirm,
    disabled,
    className,
    confirmClassName = "px-3 py-1",
}: ConfirmButtonProps) => {
    const [isConfirming, setIsConfirming] = useState(false);

    if (!isConfirming) {
        return (
            <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={() => setIsConfirming(true)}
                className={cn("text-destructive hover:bg-destructive/10 hover:text-destructive", className)}
            >
                <Trash className="h-4 w-4" aria-hidden />
                {label}
            </Button>
        );
    }

    return (
        <div
            className={cn("flex items-center gap-2", confirmClassName)}
            role="group"
        >
            <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={disabled}
                onClick={onConfirm}
                className="flex-1"
                autoFocus
            >
                {confirmLabel}
            </Button>
            <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsConfirming(false)}
            >
                Cancel
            </Button>
        </div>
    );
};
