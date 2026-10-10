import { z } from "zod";

export const ToggleCardLabel = z.object({
    cardId: z.string(),
    labelId: z.string(),
    boardId: z.string(),
});
