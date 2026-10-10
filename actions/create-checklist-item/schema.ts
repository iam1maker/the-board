import { z } from "zod";
import { MAX_CHECKLIST_TITLE_LENGTH } from "@/constants/labels";

export const CreateChecklistItem = z.object({
    checklistId: z.string(),
    boardId: z.string(),
    title: z
        .string({ required_error: "Title is required" })
        .trim()
        .min(1, { message: "Title is required" })
        .max(MAX_CHECKLIST_TITLE_LENGTH, { message: "Title is too long" }),
});
