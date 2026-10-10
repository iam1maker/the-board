"use client";

import { AuditLog } from "@prisma/client";
import { ActivityIcon } from "lucide-react";

import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "./section-heading";

interface ActivityProps {
    items: AuditLog[];
}

export const Activity = ({ items }: ActivityProps) => {
    return (
        <section>
            <SectionHeading icon={ActivityIcon}>Activity</SectionHeading>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
                <ol className="space-y-4">
                    {items.map((item) => (
                        <ActivityItem key={item.id} data={item} />
                    ))}
                </ol>
            )}
        </section>
    );
};

Activity.Skeleton = function ActivitySkeleton() {
    return (
        <div className="w-full">
            <Skeleton className="mb-3 h-5 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>
    );
};
