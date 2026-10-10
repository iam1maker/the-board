"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { CardWithList } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmButton } from "@/components/confirm-button";
import { useAction } from "@/hooks/use-action";
import { useCardModal } from "@/hooks/use-card-modal";
import { deleteCard } from "@/actions/delete-card";
import { copyCard } from "@/actions/copy-card";

const DATE_FORMAT = "MMM d, yyyy";

interface ActionsProps {
    data: CardWithList;
}

const SidebarLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {children}
    </p>
);

/**
 * `Actions`组件：卡片的复制、删除操作，以及创建/更新时间。
 */
export const Actions = ({ data }: ActionsProps) => {
    const params = useParams();
    const cardModal = useCardModal();

    const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(
        copyCard,
        {
            onSuccess(data) {
                toast.success(`Card "${data.title}" copied`);
                cardModal.onClose();
            },
            onError(error) {
                toast.error(error);
            },
        }
    );

    const { execute: executeDeleteCard, isLoading: isLoadingDelete } =
        useAction(deleteCard, {
            onSuccess(data) {
                toast.success(`Card "${data.title}" deleted`);
                cardModal.onClose();
            },
            onError(error) {
                toast.error(error);
            },
        });

    const boardId = params.boardId as string;

    return (
        <aside className="space-y-6">
            <div>
                <SidebarLabel>Actions</SidebarLabel>
                <div className="space-y-1.5">
                    <Button
                        onClick={() => executeCopyCard({ id: data.id, boardId })}
                        disabled={isLoadingCopy}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                    >
                        <Copy className="h-4 w-4" aria-hidden />
                        Copy card
                    </Button>
                    {/* 删除需要二次确认，防止误删。 */}
                    <ConfirmButton
                        label="Delete card"
                        confirmLabel="Delete"
                        disabled={isLoadingDelete}
                        onConfirm={() => executeDeleteCard({ id: data.id, boardId })}
                        className="h-9 w-full justify-start border border-input px-3"
                        confirmClassName="p-0"
                    />
                </div>
            </div>
            <div>
                <SidebarLabel>Details</SidebarLabel>
                <dl className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-x-2">
                        <dt className="text-muted-foreground">Created</dt>
                        <dd className="text-foreground">
                            {format(new Date(data.createdAt), DATE_FORMAT)}
                        </dd>
                    </div>
                    <div className="flex justify-between gap-x-2">
                        <dt className="text-muted-foreground">Updated</dt>
                        <dd className="text-foreground">
                            {format(new Date(data.updatedAt), DATE_FORMAT)}
                        </dd>
                    </div>
                </dl>
            </div>
        </aside>
    );
};

Actions.Skeleton = function ActionsSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
        </div>
    );
};
