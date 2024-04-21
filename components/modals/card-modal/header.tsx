"use client";

import { toast } from "sonner";

import { Layout } from "lucide-react";
import { CardWithList } from "@/types";
import { FormInput } from "@/components/form/form-input";
import { ElementRef, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useAction } from "@/hooks/use-action";

import { updateCard } from "@/actions/update-card";

interface HeaderProps {
    data: CardWithList;
}

/**
 * Header组件用于展示和编辑卡片标题。
 *
 * @param {HeaderProps} props - 组件接收的props。
 * @param {CardWithList} props.data - 包含卡片和列表信息的数据。
 * @returns 返回Header组件的JSX。
 */
export const Header = ({ data }: HeaderProps) => {
    // 使用QueryClient和URL参数。
    const queryClient = useQueryClient();
    const params = useParams();

    // 使用useAction创建一个执行更新卡片动作的 hook，并配置成功和失败时的行为。
    const { execute } = useAction(updateCard, {
        onSuccess: (data) => {
            // 更新成功时，刷新卡片查询数据并显示成功提示。
            queryClient.invalidateQueries({
                queryKey: ["card", data.id],
            });

            queryClient.invalidateQueries({
                queryKey: ["card-logs", data.id],
            });

            toast.success(`Renamed to "${data.title}"`);
        },
        onError(error) {
            // 更新失败时，显示错误提示。
            toast.error(error);
        },
    });

    // 输入框的ref，用于在失去焦点时提交表单。
    const inputRef = useRef<ElementRef<"input">>(null);

    // 使用useState跟踪卡片标题的变化。
    const [title, setTitle] = useState(data.title);

    // 失去焦点时的处理函数，用于提交表单。
    const onBlur = () => {
        inputRef?.current?.form?.requestSubmit();
    };

    // 表单提交时的处理函数，用于执行更新动作。
    const onSubmit = (formData: FormData) => {
        // 从表单数据中获取标题和列表ID。
        const title = formData.get("title") as string;
        const boardId = params.boardId as string;

        // 如果标题未变化，则不执行更新。
        if (title === data.title) {
            return;
        }

        // 执行更新动作。
        execute({
            title,
            boardId,
            id: data.id,
        });
    };

    // 渲染Header组件的JSX结构。
    return (
        <div className="flex items-start gap-x-3 mb-6 w-full">
            <Layout className="h-5 w-5 mt-1 text-neutral-700" />
            <div className="w-full">
                <form action={onSubmit}>
                    <FormInput
                        ref={inputRef}
                        onBlur={onBlur}
                        id="title"
                        defaultValue={title}
                        className=" font-semibold text-xl px-1 text-neutral-700 
                        bg-transparent border-transparent relative -left-1.5 w-[90%]
                      focus-visible:bg-white focus-visible:border-input mb-0.5
                        truncate"
                    />
                </form>
                <p className="text-sm text-muted-foreground">
                    in list
                    <span className=" underline"> {data.list.title} </span>
                </p>
            </div>
        </div>
    );
};

/**
 * Header.Skeleton是一个加载中的占位组件，用于在数据加载时显示。
 *
 * @returns 返回Header Skeleton组件的JSX。
 */
Header.Skeleton = function HeaderSkeleton() {
    return (
        <div className="flex items-start gap-x-3 mb-6">
            <Skeleton className="h-6 w-6 mt-1 bg-neutral-200" />
            <div>
                <Skeleton className="w-24 h-6 mb-1 bg-neutral-200" />
                <Skeleton className="w-12 h-4 bg-neutral-200" />
            </div>
        </div>
    );
};
