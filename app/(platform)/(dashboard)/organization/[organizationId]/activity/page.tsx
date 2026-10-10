import { Suspense } from "react";

import { Separator } from "@/components/ui/separator";
import { checkSubscription } from "@/lib/subscription";
import { Info } from "../_components/info";
import { ActivityList } from "./_components/activity-list";

const ActivityPage = async () => {
    const isPro = await checkSubscription();

    return (
        <div className="mb-20 w-full">
            <Info isPro={isPro} />
            <Separator className="my-6" />
            <h2 className="mb-4 text-lg font-semibold text-foreground">
                Activity
            </h2>
            <Suspense fallback={<ActivityList.Skeleton />}>
                <ActivityList />
            </Suspense>
        </div>
    );
};

export default ActivityPage;
