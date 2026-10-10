import { XCircleIcon } from "lucide-react";

interface FormErrorsProps {
    id: string;
    errors?: Record<string, string[] | undefined>;
}

export const FormErrors = ({ id, errors }: FormErrorsProps) => {
    if (!errors) return null;

    return (
        <div
            id={`${id}-error`}
            aria-live="polite"
            className="mt-2 space-y-1 text-xs text-destructive"
        >
            {errors?.[id]?.map((error: string) => (
                <div
                    key={error}
                    className="flex items-center gap-x-2 rounded-md border border-destructive/20 bg-destructive/5 p-2 font-medium"
                >
                    <XCircleIcon className="h-4 w-4 shrink-0" aria-hidden />
                    {error}
                </div>
            ))}
        </div>
    );
};
