import { z } from "zod";

import { MAX_RICH_TEXT_LENGTH } from "@/constants/labels";

export const CreateComment = z.object({
    cardId: z.string(),
    boardId: z.string(),
    // Markdown
    content: z
        .string({ required_error: "Comment is required" })
        .trim()
        .min(1, { message: "Comment is required" })
        .max(MAX_RICH_TEXT_LENGTH, { message: "Comment is too long" }),
});
