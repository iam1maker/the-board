"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft } from "lucide-react";
import { toast } from "sonner";

import { CardDetail } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text/rich-text-editor";
import { RichTextViewer } from "@/components/rich-text/rich-text-viewer";
import { useCardAction } from "@/hooks/use-card-action";
import { updateCard } from "@/actions/update-card";
import { SectionHeading } from "./section-heading";

interface DescriptionProps {
    card: CardDetail;
}

export const Description = ({ card }: DescriptionProps) => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    const { execute, isLoading } = useCardAction(updateCard, card.id, {
        refreshLogs: true,
        onSuccess: (updated) => {
            // 直接写入缓存，保存后立即显示新描述。
            queryClient.setQueryData<CardDetail>(["card", updated.id], (old) =>
                old ? { ...old, description: updated.description } : old,
            );
            toast.success("Description saved");
            setIsEditing(false);
        },
    });

    const save = (markdown: string) => {
        if (markdown === (card.description ?? "")) {
            setIsEditing(false);
            return;
        }
        execute({
            id: card.id,
            boardId: card.list.board.id,
            description: markdown,
        });
    };

    return (
        <section>
            <SectionHeading
                icon={AlignLeft}
                action={
                    card.description && !isEditing ? (
                        <Button
                            size="sm"
                            variant="gray"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    ) : null
                }
            >
                Description
            </SectionHeading>
            <div className="pl-8">
                {isEditing ? (
                    <RichTextEditor
                        initialContent={card.description ?? ""}
                        placeholder="Add a more detailed description…"
                        isSubmitting={isLoading}
                        autoFocus
                        onSubmit={save}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : card.description ? (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                            // Let links inside the description open instead of entering edit mode.
                            if ((e.target as HTMLElement).closest("a")) return;
                            setIsEditing(true);
                        }}
                        onKeyDown={(e) =>
                            e.key === "Enter" && setIsEditing(true)
                        }
                        className="cursor-text rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Edit description"
                    >
                        <RichTextViewer content={card.description} />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="min-h-[72px] w-full rounded-lg border border-dashed border-input px-3.5 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Add a more detailed description…
                    </button>
                )}
            </div>
        </section>
    );
};

Description.Skeleton = function DescriptionSkeleton() {
    return (
        <div className="w-full">
            <Skeleton className="mb-3 h-5 w-28" />
            <Skeleton className="h-[72px] w-full" />
        </div>
    );
};
