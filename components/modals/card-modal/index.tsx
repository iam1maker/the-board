"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { AuditLog, Comment } from "@prisma/client";

import { cn } from "@/lib/utils";
import { CardDetail } from "@/types";
import { fetcher } from "@/lib/fetcher";
import { COVER_COLORS, CoverColor } from "@/constants/labels";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardModal } from "@/hooks/use-card-modal";
import { TopBar } from "./top-bar";
import { Header } from "./header";
import { CardMeta } from "./card-meta";
import { Description } from "./description";
import { Checklists } from "./checklists";
import { CommentsActivity } from "./comments-activity";

export const CardModal = () => {
    const id = useCardModal((state) => state.id);
    const isOpen = useCardModal((state) => state.isOpen);
    const onClose = useCardModal((state) => state.onClose);

    const { data: card } = useQuery<CardDetail>({
        queryKey: ["card", id],
        queryFn: () => fetcher(`/api/cards/${id}`),
        enabled: !!id,
    });
    const { data: logs } = useQuery<AuditLog[]>({
        queryKey: ["card-logs", id],
        queryFn: () => fetcher(`/api/cards/${id}/logs`),
        enabled: !!id,
    });
    const { data: comments } = useQuery<Comment[]>({
        queryKey: ["card-comments", id],
        queryFn: () => fetcher(`/api/cards/${id}/comments`),
        enabled: !!id,
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                // Anchored near the top so the dialog doesn't re-center (and move
                // buttons under the pointer) when sections expand or collapse.
                className="top-[5vh] flex max-h-[90vh] max-w-5xl translate-y-0 flex-col gap-0 overflow-hidden p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2"
                aria-describedby={undefined}
                // Don't jump straight into editing the title when the card opens.
                onOpenAutoFocus={(e) => e.preventDefault()}
                // Escape inside an editor or input cancels that edit instead of
                // closing the whole card (Radix sees the key before the editor does).
                onEscapeKeyDown={(e) => {
                    const target = e.target as HTMLElement | null;
                    if (target?.closest(".ProseMirror, input, textarea")) {
                        e.preventDefault();
                    }
                }}
            >
                {!card ? (
                    <ModalSkeleton />
                ) : (
                    <>
                        <Cover card={card} />
                        <TopBar card={card} />
                        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_380px] md:overflow-hidden">
                            <div className="space-y-8 p-6 md:overflow-y-auto">
                                <div className="space-y-4">
                                    <Header card={card} />
                                    <div className="pl-8">
                                        <CardMeta card={card} />
                                    </div>
                                </div>
                                <Description card={card} />
                                <Checklists card={card} />
                            </div>
                            <div className="border-t bg-muted/50 p-5 md:overflow-y-auto md:border-l md:border-t-0">
                                <CommentsActivity
                                    card={card}
                                    comments={comments}
                                    logs={logs}
                                />
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

const Cover = ({ card }: { card: CardDetail }) => {
    if (card.coverImageUrl) {
        return (
            <div className="relative h-36 shrink-0 bg-muted">
                <Image
                    src={card.coverImageUrl}
                    alt=""
                    fill
                    sizes="1024px"
                    className="object-cover"
                />
            </div>
        );
    }
    if (card.coverColor) {
        return (
            <div
                className={cn(
                    "h-20 shrink-0",
                    COVER_COLORS[card.coverColor as CoverColor] ??
                        COVER_COLORS.slate,
                )}
            />
        );
    }
    return null;
};

const ModalSkeleton = () => (
    <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-28" />
        <Header.Skeleton />
        <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-[72px] w-full" />
    </div>
);
