"use client";

import { stripeRedirect } from "@/actions/stripe-redirect";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { useProModal } from "@/hooks/use-pro-modal";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionButtonProps {
    isPro: boolean;
}

export const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
    const proModal = useProModal();
    const { execute, isLoading } = useAction(stripeRedirect, {
        onSuccess(data) {
            window.location.href = data;
        },
        onError(error) {
            toast.error(error);
        },
    });

    const onClick = () => {
        if (isPro) {
            execute({});
        } else {
            proModal.onOpen();
        }
    };

    return (
        <Button onClick={onClick} variant={"primary"} disabled={isLoading}>
            {!isPro && <Sparkles className="h-4 w-4" aria-hidden />}
            {isPro ? "Manage subscription" : "Upgrade to Pro"}
        </Button>
    );
};
