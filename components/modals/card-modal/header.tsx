"use client";

import { ElementRef, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import { CardDetail } from "@/types";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/form/form-input";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogTitle } from "@/components/ui/dialog";
import { useCardAction } from "@/hooks/use-card-action";
import { updateCard } from "@/actions/update-card";

interface HeaderProps {
    card: CardDetail;
}

/**
 * Header：完成状态 + 可编辑标题（失焦时保存）。
 */
export const Header = ({ card }: HeaderProps) => {
    const queryClient = useQueryClient();
    const boardId = card.list.board.id;
    const inputRef = useRef<ElementRef<"input">>(null);

    const { execute: executeRename } = useCardAction(updateCard, card.id, {
        refreshLogs: true,
        onSuccess: (data) => toast.success(`Renamed to "${data.title}"`),
    });

    const { execute: executeComplete } = useCardAction(updateCard, card.id, {
        refreshLogs: true,
    });

    const toggleCompleted = () => {
        const completed = !card.completed;
        // 乐观更新：先改缓存，界面立即响应。
        queryClient.setQueryData<CardDetail>(["card", card.id], (old) =>
            old ? { ...old, completed } : old,
        );
        executeComplete({ id: card.id, boardId, completed });
    };

    const onSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;
        if (title === card.title) {
            return;
        }
        executeRename({ id: card.id, boardId, title });
    };

    const CompletedIcon = card.completed ? CheckCircle2 : Circle;

    return (
        <div className="flex items-start gap-x-2">
            <button
                type="button"
                onClick={toggleCompleted}
                aria-pressed={card.completed}
                aria-label={
                    card.completed ? "Mark incomplete" : "Mark complete"
                }
                title={card.completed ? "Mark incomplete" : "Mark complete"}
                className={cn(
                    "mt-2 flex w-6 shrink-0 justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    card.completed
                        ? "text-emerald-600 hover:text-emerald-700"
                        : "text-muted-foreground hover:text-foreground",
                )}
            >
                <CompletedIcon className="h-6 w-6" aria-hidden />
            </button>
            <div className="min-w-0 flex-1">
                <DialogTitle className="sr-only">{card.title}</DialogTitle>
                <form action={onSubmit}>
                    <FormInput
                        key={card.title}
                        ref={inputRef}
                        onBlur={() => inputRef.current?.form?.requestSubmit()}
                        id="title"
                        defaultValue={card.title}
                        className="h-auto w-full truncate rounded-md border-transparent bg-transparent px-2 py-1 text-2xl font-bold tracking-tight text-foreground shadow-none hover:bg-muted focus-visible:border-input focus-visible:bg-card"
                    />
                </form>
            </div>
        </div>
    );
};

Header.Skeleton = function HeaderSkeleton() {
    return (
        <div className="flex items-center gap-x-3">
            <DialogTitle className="sr-only">Loading card</DialogTitle>
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-8 w-64" />
        </div>
    );
};
