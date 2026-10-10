import { z } from "zod";

import { LABEL_COLOR_KEYS, MAX_LABEL_NAME_LENGTH } from "@/constants/labels";

export const UpsertLabel = z.object({
    boardId: z.string(),
    // Omitted when creating a new label.
    id: z.optional(z.string()),
    name: z
        .string()
        .trim()
        .max(MAX_LABEL_NAME_LENGTH, { message: "Label name is too long" }),
    color: z.enum(LABEL_COLOR_KEYS),
});
