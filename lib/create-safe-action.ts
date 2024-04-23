import { z } from "zod";

//This type is used to represent error messages for form fields, and for each field, it can have multiple error messages.
export type FieldErrors<T> = {
    [K in keyof T]?: string[];
};

//It represents the state of an action.
export type ActionState<TInput, TOutput> = {
    fieldErrors?: FieldErrors<TInput>;
    error?: string | null;
    data?: TOutput;
};

export const createSafeAction = <TInput, TOutput>(
    scheme: z.Schema<TInput>,
    handler: (validateData: TInput) => Promise<ActionState<TInput, TOutput>>
) => {
    return async (data: TInput): Promise<ActionState<TInput, TOutput>> => {
        const validationResult = scheme.safeParse(data);
        if (!validationResult.success) {
            return {
                fieldErrors: validationResult.error.flatten()
                    .fieldErrors as FieldErrors<TInput>,
            };
        }
        return handler(validationResult.data);
    };
};
