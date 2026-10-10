import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ActionState } from "@/lib/create-safe-action";
import { useAction } from "@/hooks/use-action";

type Action<TInput, TOutput> = (
    data: TInput,
) => Promise<ActionState<TInput, TOutput>>;

interface UseCardActionOptions<TOutput> {
    /** Also refresh the card's activity log / comments. */
    refreshLogs?: boolean;
    refreshComments?: boolean;
    onSuccess?: (data: TOutput) => void;
}

/**
 * useAction for card modal mutations: refetches the card after success and
 * reports errors as toasts. The board itself refreshes via revalidatePath.
 */
export const useCardAction = <TInput, TOutput>(
    action: Action<TInput, TOutput>,
    cardId: string,
    options: UseCardActionOptions<TOutput> = {},
) => {
    const queryClient = useQueryClient();

    return useAction(action, {
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["card", cardId] });
            if (options.refreshLogs) {
                queryClient.invalidateQueries({
                    queryKey: ["card-logs", cardId],
                });
            }
            if (options.refreshComments) {
                queryClient.invalidateQueries({
                    queryKey: ["card-comments", cardId],
                });
            }
            options.onSuccess?.(data);
        },
        onError: (error) => {
            toast.error(error);
        },
    });
};
