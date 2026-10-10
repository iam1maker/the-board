"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft } from "lucide-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { toast } from "sonner";

import { CardWithList } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSubmit } from "@/components/form/form-submit";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";
import { SectionHeading } from "./section-heading";

interface DescriptionProps {
    data: CardWithList;
}

export const Description = ({ data }: DescriptionProps) => {
    const params = useParams();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    const textareaRef = useRef<ElementRef<"textarea">>(null);
    const formRef = useRef<ElementRef<"form">>(null);

    const enableEditing = () => {
        setIsEditing(true);
        setTimeout(() => {
            textareaRef.current?.focus();
        });
    };

    const disableEditing = () => {
        setIsEditing(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            disableEditing();
        }
    };

    useEventListener("keydown", onKeyDown);
    useOnClickOutside(formRef, disableEditing);

    const { execute, fieldErrors } = useAction(updateCard, {
        onSuccess(updated) {
            // 直接写入缓存，保存后立即显示新描述（之前误刷新了 ["boards", id]，导致内容"消失"）。
            queryClient.setQueryData<CardWithList>(["card", updated.id], (old) =>
                old ? { ...old, ...updated } : old
            );
            queryClient.invalidateQueries({ queryKey: ["card", updated.id] });
            queryClient.invalidateQueries({
                queryKey: ["card-logs", updated.id],
            });

            toast.success(`Card "${updated.title}" updated`);
            disableEditing();
        },
        onError(error) {
            toast.error(error);
        },
    });

    const onSubmit = (formData: FormData) => {
        const description = formData.get("description") as string;
        const boardId = params.boardId as string;

        execute({
            id: data.id,
            description,
            boardId,
        });
    };

    return (
        <section>
            <SectionHeading
                icon={AlignLeft}
                action={
                    data.description && !isEditing ? (
                        <Button
                            size="sm"
                            variant="gray"
                            className="h-7 px-2.5 text-xs"
                            onClick={enableEditing}
                        >
                            Edit
                        </Button>
                    ) : null
                }
            >
                Description
            </SectionHeading>
            {isEditing ? (
                <form action={onSubmit} ref={formRef} className="space-y-2">
                    <FormTextarea
                        id="description"
                        ref={textareaRef}
                        className="min-h-[120px] w-full bg-card"
                        placeholder="Add a more detailed description…"
                        defaultValue={data.description || undefined}
                        errors={fieldErrors}
                    />
                    <div className="flex items-center gap-x-2">
                        <FormSubmit>Save</FormSubmit>
                        <Button
                            type="button"
                            onClick={disableEditing}
                            size="sm"
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : data.description ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                    {data.description}
                </p>
            ) : (
                <button
                    type="button"
                    onClick={enableEditing}
                    className="min-h-[72px] w-full rounded-lg border border-dashed border-input px-3.5 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Add a more detailed description…
                </button>
            )}
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
