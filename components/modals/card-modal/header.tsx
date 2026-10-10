"use client";

import { ElementRef, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Columns3 } from "lucide-react";
import { toast } from "sonner";

import { CardWithList } from "@/types";
import { FormInput } from "@/components/form/form-input";
import { Skeleton } from "@/components/ui/skeleton";
import { DialogTitle } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";

interface HeaderProps {
    data: CardWithList;
}

/**
 * Header组件用于展示和编辑卡片标题，失焦时自动保存。
 */
export const Header = ({ data }: HeaderProps) => {
    const queryClient = useQueryClient();
    const params = useParams();

    const { execute } = useAction(updateCard, {
        onSuccess: (data) => {
            // 更新成功时，刷新卡片和日志数据。
            queryClient.invalidateQueries({ queryKey: ["card", data.id] });
            queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
            setTitle(data.title);
            toast.success(`Renamed to "${data.title}"`);
        },
        onError(error) {
            toast.error(error);
        },
    });

    const inputRef = useRef<ElementRef<"input">>(null);
    const [title, setTitle] = useState(data.title);

    const onBlur = () => {
        inputRef?.current?.form?.requestSubmit();
    };

    const onSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;
        const boardId = params.boardId as string;

        // 标题未变化则不更新。
        if (title === data.title) {
            return;
        }

        execute({ title, boardId, id: data.id });
    };

    return (
        <div className="px-6 pb-4 pt-6 pr-14">
            <DialogTitle className="sr-only">{title}</DialogTitle>
            <form action={onSubmit}>
                <FormInput
                    ref={inputRef}
                    onBlur={onBlur}
                    id="title"
                    defaultValue={title}
                    className="relative -left-2 h-auto w-full truncate rounded-md border-transparent bg-transparent px-2 py-1 text-2xl font-bold tracking-tight text-foreground shadow-none hover:bg-muted focus-visible:border-input focus-visible:bg-card"
                />
            </form>
            <p className="mt-1 flex items-center gap-x-1.5 text-sm text-muted-foreground">
                <Columns3 className="h-4 w-4" aria-hidden />
                in list
                <span className="font-medium text-foreground">
                    {data.list.title}
                </span>
            </p>
        </div>
    );
};

Header.Skeleton = function HeaderSkeleton() {
    return (
        <div className="px-6 pb-4 pt-6">
            <DialogTitle className="sr-only">Loading card</DialogTitle>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-28" />
        </div>
    );
};
