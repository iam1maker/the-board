"use client";

import { useState } from "react";

import { CardDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useCardAction } from "@/hooks/use-card-action";
import { createChecklist } from "@/actions/create-checklist";
import { MAX_CHECKLIST_TITLE_LENGTH } from "@/constants/labels";

const DEFAULT_TITLE = "Checklist";

interface ChecklistPopoverProps {
    card: CardDetail;
    children: React.ReactNode;
}

export const ChecklistPopover = ({ card, children }: ChecklistPopoverProps) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(DEFAULT_TITLE);

    const { execute, isLoading } = useCardAction(createChecklist, card.id, {
        onSuccess: () => {
            setOpen(false);
            setTitle(DEFAULT_TITLE);
        },
    });

    const add = () =>
        execute({ cardId: card.id, boardId: card.list.board.id, title });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align="start" className="w-72 space-y-3 p-3">
                <p className="text-center text-sm font-semibold text-foreground">
                    Add checklist
                </p>
                <div className="space-y-1">
                    <label
                        htmlFor="checklist-title"
                        className="text-xs font-semibold text-foreground"
                    >
                        Title
                    </label>
                    <Input
                        id="checklist-title"
                        value={title}
                        maxLength={MAX_CHECKLIST_TITLE_LENGTH}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && add()}
                        onFocus={(e) => e.target.select()}
                        className="h-9"
                        autoFocus
                    />
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={add}
                    disabled={isLoading || !title.trim()}
                >
                    Add
                </Button>
            </PopoverContent>
        </Popover>
    );
};
