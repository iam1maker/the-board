import { Check } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { MAX_FREE_BOARDS } from "@/constants/board";
import { checkSubscription } from "@/lib/subscription";
import { Info } from "../_components/info";
import { SubscriptionButton } from "./_components/subscription-button";

const BillingPage = async () => {
    const isPro = await checkSubscription();
    const perks = isPro
        ? ["Unlimited boards", "Everything in Free"]
        : [`Up to ${MAX_FREE_BOARDS} boards`, "Unlimited lists and cards", "Activity log"];

    return (
        <div className="mb-20 w-full">
            <Info isPro={isPro} />
            <Separator className="my-6" />
            <h2 className="mb-4 text-lg font-semibold text-foreground">Billing</h2>
            <div className="max-w-lg rounded-xl border bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">
                    Current plan
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                    {isPro ? "Taskify Pro" : "Free"}
                </p>
                <ul className="mt-4 space-y-2">
                    {perks.map((perk) => (
                        <li
                            key={perk}
                            className="flex items-center gap-x-2 text-sm text-foreground"
                        >
                            <Check className="h-4 w-4 text-primary" aria-hidden />
                            {perk}
                        </li>
                    ))}
                </ul>
                <div className="mt-6">
                    <SubscriptionButton isPro={isPro} />
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
