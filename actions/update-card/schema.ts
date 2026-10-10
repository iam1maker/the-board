import { z } from "zod";

import {
    COVER_COLOR_KEYS,
    COVER_IMAGE_HOST,
    MAX_RICH_TEXT_LENGTH,
} from "@/constants/labels";

export const UpdateCard = z.object({
    boardId: z.string(),
    id: z.string(),
    // Markdown; an empty string clears the description.
    description: z.optional(
        z
            .string({
                invalid_type_error: "Description is required",
            })
            .max(MAX_RICH_TEXT_LENGTH, {
                message: "Description is too long",
            })
    ),
    title: z.optional(
        z
            .string({
                required_error: "Title is required",
                invalid_type_error: "Title is required",
            })
            .min(3, {
                message: "Title is too short",
            })
    ),
    completed: z.optional(z.boolean()),
    startDate: z.optional(z.date().nullable()),
    dueDate: z.optional(z.date().nullable()),
    coverColor: z.optional(z.enum(COVER_COLOR_KEYS).nullable()),
    coverImageUrl: z.optional(
        z
            .string()
            .url()
            .refine((url) => url.startsWith(COVER_IMAGE_HOST), {
                message: "Unsupported cover image",
            })
            .nullable()
    ),
});
