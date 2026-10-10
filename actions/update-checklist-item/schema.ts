import { z } from "zod";
import { MAX_CHECKLIST_TITLE_LENGTH } from "@/constants/labels";

export const UpdateChecklistItem = z.object({
    id: z.string(),
    boardId: z.string(),
    completed: z.optional(z.boolean()),
    title: z.optional(
        z
            .string({ required_error: "Title is required" })
            .trim()
            .min(1, { message: "Title is required" })
            .max(MAX_CHECKLIST_TITLE_LENGTH, { message: "Title is too long" }),
    ),
});
