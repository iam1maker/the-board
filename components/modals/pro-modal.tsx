"use client";

import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useProModal } from "@/hooks/use-pro-modal";
import { useAction } from "@/hooks/use-action";
import { stripeRedirect } from "@/actions/stripe-redirect";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

const PRO_PERKS = ["Unlimited boards", "Everything in the Free plan"];

export const ProModal = () => {
    const proModal = useProModal();
    const { execute, isLoading } = useAction(stripeRedirect, {
        onSuccess: (data) => {
            window.location.href = data;
        },
        onError(error) {
            toast.error(error);
        },
    });

    const onClick = () => {
        execute({});
    };

    return (
        <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
            <DialogContent className="max-w-md overflow-hidden p-0">
                <div className="flex flex-col items-center bg-gradient-to-br from-teal-700 to-teal-900 px-6 py-10 text-center text-white">
                    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                        <Sparkles className="h-6 w-6" aria-hidden />
                    </span>
                    <DialogTitle className="text-xl font-bold">
                        Upgrade to Taskify Pro
                    </DialogTitle>
                    <p className="mt-1 text-sm text-white/80">
                        Unlock unlimited boards for this workspace.
                    </p>
                </div>
                <div className="space-y-6 p-6">
                    <ul className="space-y-2">
                        {PRO_PERKS.map((perk) => (
                            <li
                                key={perk}
                                className="flex items-center gap-x-2 text-sm text-foreground"
                            >
                                <Check
                                    className="h-4 w-4 text-primary"
                                    aria-hidden
                                />
                                {perk}
                            </li>
                        ))}
                    </ul>
                    <Button
                        disabled={isLoading}
                        onClick={onClick}
                        className="w-full"
                        variant="primary"
                    >
                        Upgrade for $20 / month
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
