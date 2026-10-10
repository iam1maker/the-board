import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import { checkSubscription } from "@/lib/subscription";
import { Info } from "./_components/info";
import { BoardList } from "./_components/board-list";

const OrganizationIdPage = async () => {
    const isPro = await checkSubscription();

    return (
        <div className="mb-20 w-full">
            <Info isPro={isPro} />
            <Separator className="my-6" />
            <Suspense fallback={<BoardList.Skeleton />}>
                <BoardList />
            </Suspense>
        </div>
    );
};

export default OrganizationIdPage;
