"use client";

import { Copy, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { useParams } from "next/navigation";
import { deleteCard } from "@/actions/delete-card";
import { copyCard } from "@/actions/copy-card";
import { useCardModal } from "@/hooks/use-card-modal";
import { toast } from "sonner";

interface ActionsProps {
    data: CardWithList;
}

/**
 * `Actions`组件用于展示和处理卡片的复制和删除操作。
 *
 * @param {ActionsProps} props - 组件接收的props。
 * @param {CardWithList} props.data - 包含卡片和其列表信息的对象。
 *
 * @returns 返回一个包含复制和删除按钮的视图。
 */
export const Actions = ({ data }: ActionsProps) => {
    // 使用`useParams`获取当前板的ID。
    const params = useParams();
    // 使用`useCardModal`获取卡片模态框的控制函数。
    const CardModal = useCardModal();

    // 使用`useAction`创建复制卡片的操作，配置成功和失败的回调。
    const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(
        copyCard,
        {
            onSuccess(data) {
                toast.success(`Card "${data.title}" copied`); // 复制成功后的提示。
                CardModal.onClose(); // 关闭模态框。
            },
            onError(error) {
                toast.error(error); // 复制失败后的提示。
            },
        }
    );
    // 使用`useAction`创建删除卡片的操作，配置成功和失败的回调。
    const { execute: executeDeleteCard, isLoading: isLoadingDelete } =
        useAction(deleteCard, {
            onSuccess(data) {
                toast.success(`Card "${data.title}" deleted`); // 删除成功后的提示。
                CardModal.onClose(); // 关闭模态框。
            },
            onError(error) {
                toast.error(error); // 删除失败后的提示。
            },
        });

    // 处理复制卡片的点击事件。
    const onCopy = () => {
        const boardId = params.boardId as string; // 获取当前板ID。
        executeCopyCard({
            id: data.id,
            boardId, // 执行复制操作。
        });
    };

    // 处理删除卡片的点击事件。
    const onDelete = () => {
        const boardId = params.boardId as string; // 获取当前板ID。
        executeDeleteCard({
            id: data.id,
            boardId, // 执行删除操作。
        });
    };

    // 渲染复制和删除按钮。
    return (
        <div className=" space-y-2 mt-2">
            <p className=" text-xs font-semibold">Actions</p>
            <Button
                onClick={onCopy}
                disabled={isLoadingCopy} // 当复制操作加载中时，禁用按钮。
                variant={"gray"}
                size={"inline"}
                className=" w-full justify-start"
            >
                <Copy className="h-4 w-4 mr-2" />
                Copy
            </Button>
            <Button
                onClick={onDelete}
                disabled={isLoadingDelete} // 当删除操作加载中时，禁用按钮。
                variant={"gray"}
                size={"inline"}
                className=" w-full justify-start"
            >
                <Trash className="h-4 w-4 mr-2" />
                Delete
            </Button>
        </div>
    );
};

/**
 * `ActionsSkeleton`组件用于展示加载中的动作按钮占位符。
 *
 * @returns 返回一个包含复制和删除按钮占位符的视图。
 */
Actions.Skeleton = function ActionsSkeleton() {
    return (
        <div className=" space-y-2 mt-2">
            <Skeleton className=" w-20 h-4 bg-neutral-200" />{" "}
            {/* 复制按钮占位符 */}
            <Skeleton className=" w-fill h-8 bg-neutral-200" />{" "}
            {/* 删除按钮占位符 */}
            <Skeleton className=" w-full h-8 bg-neutral-200" />{" "}
            {/* 分隔线占位符 */}
        </div>
    );
};
