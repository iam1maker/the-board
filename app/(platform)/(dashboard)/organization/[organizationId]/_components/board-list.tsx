import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import { db } from "@/lib/db";
import { FormPopover } from "@/components/form/form-popover";
import { Skeleton } from "@/components/ui/skeleton";
import { MAX_FREE_BOARDS } from "@/constants/board";
import { getAvailableCount } from "@/lib/org-limit";
import { checkSubscription } from "@/lib/subscription";

const SKELETON_COUNT = 8;

export const BoardList = async () => {
    const { orgId } = auth();

    if (!orgId) {
        return redirect("/select-org");
    }

    const boards = await db.board.findMany({
        where: {
            orgId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const availableCount = await getAvailableCount();
    const isPro = await checkSubscription();
    const remaining = Math.max(MAX_FREE_BOARDS - availableCount, 0);

    return (
        <section className="space-y-4">
            <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                    Your boards
                </h2>
                <span className="text-sm text-muted-foreground">
                    {boards.length} {boards.length === 1 ? "board" : "boards"}
                </span>
            </div>
            {boards.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No boards yet. Create your first one to start organizing work.
                </p>
            )}
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {boards.map((board) => (
                    <li key={board.id}>
                        <Link
                            href={`/board/${board.id}`}
                            className="group relative flex aspect-video w-full items-end overflow-hidden rounded-xl bg-primary bg-cover bg-center bg-no-repeat p-3 shadow-sm ring-offset-2 ring-offset-background transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            style={{
                                backgroundImage: `url(${board.imageThumbUrl})`,
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-colors group-hover:from-black/80" />
                            <p className="relative line-clamp-2 text-sm font-semibold text-white">
                                {board.title}
                            </p>
                        </Link>
                    </li>
                ))}
                <li>
                    <FormPopover sideOffset={10} side="right">
                        <button
                            type="button"
                            className="flex aspect-video w-full flex-col items-center justify-center gap-y-1 rounded-xl border-2 border-dashed border-input bg-card text-muted-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Plus className="h-5 w-5" aria-hidden />
                            <span className="text-sm font-medium">
                                Create new board
                            </span>
                            <span className="text-xs">
                                {isPro
                                    ? "Unlimited on Pro"
                                    : `${remaining} of ${MAX_FREE_BOARDS} free boards left`}
                            </span>
                        </button>
                    </FormPopover>
                </li>
            </ul>
        </section>
    );
};

BoardList.Skeleton = function SkeletonBoardList() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <Skeleton key={i} className="aspect-video w-full rounded-xl" />
            ))}
        </div>
    );
};
