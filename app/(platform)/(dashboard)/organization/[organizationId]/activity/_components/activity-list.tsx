import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { History } from "lucide-react";

import { db } from "@/lib/db";
import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_WIDTHS = ["w-[80%]", "w-[50%]", "w-[70%]", "w-[80%]", "w-[75%]"];

export const ActivityList = async () => {
    const { orgId } = auth();

    if (!orgId) {
        redirect("/select-org");
    }

    const auditLogs = await db.auditLog.findMany({
        where: {
            orgId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (auditLogs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <History className="h-5 w-5" aria-hidden />
                </span>
                <p className="font-medium text-foreground">No activity yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Changes to boards, lists and cards in this workspace will
                    show up here.
                </p>
            </div>
        );
    }

    return (
        <ol className="space-y-5 rounded-xl border bg-card p-5">
            {auditLogs.map((log) => (
                <ActivityItem key={log.id} data={log} />
            ))}
        </ol>
    );
};

ActivityList.Skeleton = function ActivityListSkeleton() {
    return (
        <div className="space-y-4 rounded-xl border bg-card p-5">
            {SKELETON_WIDTHS.map((width, i) => (
                <Skeleton key={i} className={`h-12 ${width}`} />
            ))}
        </div>
    );
};
