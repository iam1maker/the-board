"use client";

import { useQuery } from "@tanstack/react-query";
import { AuditLog } from "@prisma/client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCardModal } from "@/hooks/use-card-modal";
import { CardWithList } from "@/types";
import { fetcher } from "@/lib/fetcher";
import { Header } from "./header";
import { Description } from "./description";
import { Actions } from "./actions";
import { Activity } from "./activity";

export const CardModal = () => {
    const id = useCardModal((state) => state.id);
    const isOpen = useCardModal((state) => state.isOpen);
    const onClose = useCardModal((state) => state.onClose);

    const { data: cardData } = useQuery<CardWithList>({
        queryKey: ["card", id],
        queryFn: () => fetcher(`/api/cards/${id}`),
        enabled: !!id,
    });
    const { data: auditLogsData } = useQuery<AuditLog[]>({
        queryKey: ["card-logs", id],
        queryFn: () => fetcher(`/api/cards/${id}/logs`),
        enabled: !!id,
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                // Anchored near the top: a centered dialog shifts when the description
                // editor collapses, which made clicks on the sidebar buttons miss.
                className="top-[8vh] max-h-[84vh] max-w-2xl translate-y-0 gap-0 p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2"
                aria-describedby={undefined}
                // Don't jump straight into editing the title when the card opens.
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {!cardData ? <Header.Skeleton /> : <Header data={cardData} />}
                <div className="grid grid-cols-1 gap-8 px-6 pb-6 pt-2 sm:grid-cols-[1fr_180px]">
                    <div className="min-w-0 space-y-8">
                        {!cardData ? (
                            <Description.Skeleton />
                        ) : (
                            <Description data={cardData} />
                        )}
                        {!auditLogsData ? (
                            <Activity.Skeleton />
                        ) : (
                            <Activity items={auditLogsData} />
                        )}
                    </div>
                    {!cardData ? (
                        <Actions.Skeleton />
                    ) : (
                        <Actions data={cardData} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
