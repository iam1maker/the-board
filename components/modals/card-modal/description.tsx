"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithList } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { AlignLeft } from "lucide-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { updateCard } from "@/actions/update-card";
import { cn } from "@/lib/utils";

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
        onSuccess(data) {
            queryClient.invalidateQueries({
                queryKey: ["boards", data.id],
            });

            queryClient.invalidateQueries({
                queryKey: ["card-logs", data.id],
            });

            toast.success(`Card "${data.title}" updated`);
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
        <div className=" flex items-start gap-x-3 w-full">
            <AlignLeft
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden
            />
            <div className="w-full">
                <h3 className="mb-2 font-semibold text-foreground">
                    Description
                </h3>
                {isEditing ? (
                    <form
                        action={onSubmit}
                        ref={formRef}
                        className="space-y-2"
                    >
                        <FormTextarea
                            id="description"
                            ref={textareaRef}
                            className="min-h-[96px] w-full"
                            placeholder="Add a more detailed description"
                            defaultValue={data.description || undefined}
                            errors={fieldErrors}
                        />
                        <div className="flex items-center gap-x-2">
                            <FormSubmit>Save</FormSubmit>
                            <Button
                                type="button"
                                onClick={disableEditing}
                                size={"sm"}
                                variant={"ghost"}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <button
                        type="button"
                        onClick={enableEditing}
                        className={cn(
                            "min-h-[78px] w-full whitespace-pre-wrap rounded-lg px-3.5 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            data.description
                                ? "bg-transparent text-foreground hover:bg-muted"
                                : "bg-muted text-muted-foreground hover:bg-accent"
                        )}
                    >
                        {data.description || "Add a more detailed description…"}
                    </button>
                )}
            </div>
        </div>
    );
};

Description.Skeleton = function DescriptionSkeleton() {
    return (
        <div className="flex w-full items-start gap-x-3">
            <Skeleton className="h-6 w-6" />
            <div className="w-full">
                <Skeleton className="mb-2 h-6 w-24" />
                <Skeleton className="h-[78px] w-full" />
            </div>
        </div>
    );
};
