"use client";

import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLog } from "@prisma/client";
import { ActivityIcon } from "lucide-react";

interface ActivityProps {
    items: AuditLog[];
}

export const Activity = ({ items }: ActivityProps) => {
    return (
        <div className="flex w-full items-start gap-x-3">
            <ActivityIcon
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden
            />
            <div className="w-full">
                <h3 className="mb-2 font-semibold text-foreground">Activity</h3>
                <ol className="mt-3 space-y-4">
                    {items.map((item) => (
                        <ActivityItem key={item.id} data={item} />
                    ))}
                </ol>
            </div>
        </div>
    );
};

Activity.Skeleton = function ActivitySkeleton() {
    return (
        <div className="flex w-full items-start gap-x-3">
            <Skeleton className="h-6 w-6" />
            <div className="w-full">
                <Skeleton className="mb-2 h-6 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
};
